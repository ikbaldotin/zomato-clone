import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import {
  addResturant,
  fetchMyResturant,
  fetchSingleResturant,
  getNearByResturant,
  updateResturant,
  updateStatusResturant,
} from "../controllers/resturant.js";
const router = express.Router();
router.post("/new", isAuth, isSeller, uploadFile, addResturant);
router.get("/my", isAuth, isSeller, fetchMyResturant);
router.put("/status", isAuth, isSeller, updateStatusResturant);
router.put("/edit", isAuth, isSeller, updateResturant);
router.get("/all", isAuth, getNearByResturant);
router.get("/:id", isAuth, fetchSingleResturant);
export default router;
