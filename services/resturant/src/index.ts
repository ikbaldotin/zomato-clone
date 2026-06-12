import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import resturantRouter from "./routes/resturant.js";
import menuItemRouter from "./routes/menuitem.js";
import cors from "cors";
dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use("/api/resturant", resturantRouter);
app.use("/api/item", menuItemRouter);
app.listen(port, () => {
  console.log(`Resturant services is running on port ${port}`);
  connectDB();
});
