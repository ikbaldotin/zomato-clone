import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI as string;

    await mongoose.connect(MONGODB_URI, {
      dbName: "tomato",
    });
    console.log("connect to mongodb");
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;
