import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// TASK: MAKE CONNECTION TO DB
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      "MongoDB connected !! db host: " + connectionInstance.connection.host
    );
  } catch (error) {
    console.log("MongoDB connection failed: " + error);
    process.exit(1);
  }
};

export default connectDB;
