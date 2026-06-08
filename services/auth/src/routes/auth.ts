import express from "express";
import { addUserRole, loginUser, myProfile } from "../controllers/auth.js";
import { isAuth } from "../middleware/isauth.js";
const AuthRoute = express.Router();
AuthRoute.post("/login", loginUser);
AuthRoute.put("/add/role", isAuth, addUserRole);
AuthRoute.get("/me", isAuth, myProfile);
export default AuthRoute;
