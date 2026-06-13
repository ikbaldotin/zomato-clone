import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import uploadRoute from "./routes/cloudinary.js";
import paymentRoute from "./routes/payment.js";
import cloudinary from "cloudinary";
import { connectRabbitMQ } from "./config/rabbitmq.js";
dotenv.config();
connectRabbitMQ();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;
if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY) {
  throw new Error(
    "Cloudinary configuration is missing in environment variables",
  );
}
cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KEY,
});
const port = process.env.PORT;
app.use("/api", uploadRoute);
app.use("/api/payment", paymentRoute);
app.listen(port, () => {
  console.log(`Utils services is running on port ${port}`);
});
