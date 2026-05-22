#!/bin/bash

set -e

ENV_FILE=".env"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# ── Read app name from env file ──────────────────────────────────────────────
function load_app_name() {
    local raw=""
    if [ -f "$ENV_FILE" ]; then
        raw=$(grep -E '^NEXT_PUBLIC_APP_NAME=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"'"'" | xargs)
    fi
    # Fallback to package.json name, then "app"
    if [ -z "$raw" ] && [ -f "package.json" ]; then
        raw=$(grep '"name"' package.json | head -1 | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/')
    fi
    echo "${raw:-app}"
}

APP_NAME=$(load_app_name)
# Slugify: lowercase, spaces/special chars → hyphens
APP_SLUG=$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')

# ── Find a free port starting from a preferred one ───────────────────────────
function find_free_port() {
    local preferred="${1:-3000}"
    local port="$preferred"
    while lsof -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1; do
        port=$((port + 1))
    done
    echo "$port"
}

# ── Env check / bootstrap ────────────────────────────────────────────────────
function check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        log_warn ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example "$ENV_FILE"
            log_warn "Please edit $ENV_FILE and fill in all required values before running."
        else
            log_error ".env.example not found. Cannot create .env"
            exit 1
        fi
    fi
    # Re-read app name now that .env exists
    APP_NAME=$(load_app_name)
    APP_SLUG=$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
}

# ── Docker compose wrapper (injects dynamic vars) ────────────────────────────
function dc() {
    APP_NAME="$APP_NAME" APP_SLUG="$APP_SLUG" HOST_PORT="$HOST_PORT" docker compose "$@"
}

function build() {
    local port
    port=$(find_free_port 3000)
    HOST_PORT="$port"
    log_info "Building image for ${BOLD}${APP_NAME}${NC}..."
    dc build app
    log_success "Image built"
}

function up() {
    check_env
    HOST_PORT=$(find_free_port 3000)
    export HOST_PORT APP_NAME APP_SLUG
    log_info "Starting ${BOLD}${APP_NAME}${NC}..."
    dc up -d
    log_success "${BOLD}${APP_NAME}${NC} is running → ${CYAN}http://localhost:${HOST_PORT}${NC}"
}

function down() {
    HOST_PORT=3000  # value doesn't matter for down
    log_info "Stopping ${BOLD}${APP_NAME}${NC}..."
    dc down
    log_success "${BOLD}${APP_NAME}${NC} stopped"
}

function restart() {
    down
    up
}

function rebuild() {
    down
    build
    up
}

function logs() {
    HOST_PORT=3000
    dc logs -f app
}

function shell() {
    HOST_PORT=3000
    dc exec app sh
}

function mongo_shell() {
    HOST_PORT=3000
    log_info "Opening MongoDB shell..."
    dc exec mongo mongosh
}

function status() {
    HOST_PORT=3000
    dc ps
}

function clean() {
    HOST_PORT=3000
    log_warn "This will remove all containers, volumes, and the built image for ${BOLD}${APP_NAME}${NC}."
    read -r -p "Are you sure? [y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        dc down -v --rmi local
        log_success "Cleaned up containers, volumes, and images"
    else
        log_info "Cancelled"
    fi
}

function help() {
    APP_NAME=$(load_app_name)
    echo -e "${BOLD}${APP_NAME}${NC} — Docker Management"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  build       Build the Docker image"
    echo "  up          Start the app and MongoDB (auto-selects a free port)"
    echo "  down        Stop all containers"
    echo "  restart     Restart all containers"
    echo "  rebuild     Rebuild image and restart"
    echo "  logs        Tail app logs"
    echo "  shell       Open a shell in the app container"
    echo "  mongo       Open a MongoDB shell"
    echo "  status      Show container status"
    echo "  clean       Remove containers, volumes, and images"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 up"
    echo "  $0 logs"
}

case "${1:-help}" in
    build)   build ;;
    up)      up ;;
    down)    down ;;
    restart) restart ;;
    rebuild) rebuild ;;
    logs)    logs ;;
    shell)   shell ;;
    mongo)   mongo_shell ;;
    status)  status ;;
    clean)   clean ;;
    help|--help|-h) help ;;
    *)
        log_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
