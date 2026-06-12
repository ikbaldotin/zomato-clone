import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
export interface IUser {
  _id: String;
  name: String;
  email: String;
  image: String;
  role: String;
  resturantId: String;
}
export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please login no auth header ",
      });
      return;
    }
    const token = auth.split(" ")[1];
    if (!token) {
      res.status(401).json({
        message: "Please login token missing",
      });
      return;
    }
    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SEC as string,
    ) as JwtPayload;
    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({
        message: "token invalid",
      });
      return;
    }
    req.user = decodedValue.user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Please login - jwt error" });
  }
};

export const isSeller = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const user = req.user;
  if (user && user.role !== "seller") {
    res.status(401).json({
      message: "You are not authorized seller",
    });
    return;
  }
  next();
};
