import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  try {
    await connectDB();
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  const healthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
