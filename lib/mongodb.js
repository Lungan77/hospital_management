import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Ensure the cached connection object exists in global scope (prevents multiple connections in dev)
global.mongoose = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (global.mongoose.conn) return global.mongoose.conn;

  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose.connect(MONGODB_URI, {
      dbName: "HospitalDB", // Optional: specify database name
    }).then((mongoose) => mongoose);
  }

  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
}
