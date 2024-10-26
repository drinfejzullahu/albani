import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/albani");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Connection error:", error);
    process.exit(1); // Stop the app if the DB connection fails
  }
};

export default connectDB;
