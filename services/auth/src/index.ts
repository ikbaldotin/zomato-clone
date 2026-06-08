import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import AuthRoute from "./routes/auth.js";
dotenv.config();
const app = express();
const port = process.env.PORT;
connectDB();
app.use(cors());
app.use(express.json());
app.use("/api/auth", AuthRoute);
app.listen(port, () => {
  console.log(`Auth services is running on port ${port}`);
});
