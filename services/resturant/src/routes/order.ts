import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createOrder, fetchOrderForPaymen } from "../controllers/order.js";
const router = express.Router();
router.post("/create", isAuth, createOrder);
router.get("/payment/:id", isAuth, fetchOrderForPaymen);
export default router;
