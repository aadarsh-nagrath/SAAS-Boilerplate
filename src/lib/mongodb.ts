import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;

if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

declare global {
  var _mongooseConn: typeof mongoose | null;
  var _mongoosePromise: Promise<typeof mongoose> | null;
}

let cached = global._mongooseConn;
let promise = global._mongoosePromise;

export async function connectDB() {
  if (cached) return cached;

  if (!promise) {
    promise = mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
  }

  cached = await promise;
  global._mongooseConn = cached;
  global._mongoosePromise = promise;

  return cached;
}
