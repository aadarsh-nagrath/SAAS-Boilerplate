import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoose from "mongoose";
import { connectDB } from "./connection";

// Reuse the Mongoose connection's underlying MongoClient so we don't
// open a second connection pool just for the NextAuth adapter.
async function getClient() {
  await connectDB();
  return mongoose.connection.getClient();
}

export const mongoAdapter = MongoDBAdapter(getClient(), {
  databaseName: process.env.MONGODB_DB_NAME,
});
