import mongoose from "mongoose";
import config from "./config.js";

async function dbConnect() {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("unable connected to database", error);
  }
}

export default dbConnect;
