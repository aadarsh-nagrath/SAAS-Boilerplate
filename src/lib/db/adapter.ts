import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined");

const client = new MongoClient(process.env.MONGODB_URI);

export const mongoAdapter = MongoDBAdapter(client, {
  databaseName: process.env.MONGODB_DB_NAME,
});
