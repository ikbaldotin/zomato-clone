import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Cart from "../models/Cart.js";
export const addToCart = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user._id;

  const { resturantId, itemId } = req.body;
  if (
    !mongoose.Types.ObjectId.isValid(resturantId) &&
    !mongoose.Types.ObjectId.isValid(itemId)
  ) {
    return res.status(400).json({ message: "Invalid resturantId or itemId" });
  }
  const cartFromDifferentResturant = await Cart.findOne({
    userId: userId.toString(),
    resturantId: { $ne: resturantId },
  });
  if (cartFromDifferentResturant) {
    return res.status(400).json({
      message:
        "You can order from only one resturant at a time. Please clear your cart first.  ",
    });
  }
  const cartItem = await Cart.findOneAndUpdate(
    {
      userId: userId.toString(),
      resturantId,
      itemId,
    },
    {
      $inc: { quantity: 1 },
      $setOnInsert: { userId: userId.toString(), resturantId, itemId },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
  return res.json({
    message: "Item added to cart",
    cart: cartItem,
  });
});

export const fetchMyCart = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user._id;
  const cartItems = await Cart.find({ userId: userId.toString() })
    .populate("itemId")
    .populate("resturant");
  let subTotal = 0;
  let cartLength = 0;
  for (const cartItem of cartItems) {
    const item: any = cartItem.itemId;
    subTotal += item.price * cartItem.quantity;
    cartLength += cartItem.quantity;
  }
  return res.json({
    success: true,
    subTotal,
    cartLength,
    cart: cartItems,
  });
});
export const incrementCartItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;
    if (!userId || !itemId) {
      return res.status(400).json({ message: "Missing userId or itemId" });
    }
    const cartItem = await Cart.findOneAndUpdate(
      {
        userId: userId.toString(),
        itemId,
      },
      { $inc: { quantity: 1 } },
      { new: true },
    );
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    return res.json({ message: "Cart item quantity increased", cartItem });
  },
);
export const decrementCartItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;
    if (!userId || !itemId) {
      return res.status(400).json({ message: "Missing userId or itemId" });
    }
    const cartItem = await Cart.findOneAndUpdate({
      userId: userId.toString(),
      itemId,
    });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (cartItem.quantity === 1) {
      await Cart.deleteOne({ userId: userId.toString(), itemId });
      return res.json({ message: "Cart item removed", cartItem });
    }
    cartItem.quantity -= 1;
    await cartItem.save();
    return res.json({ message: "Cart item quantity decreased", cartItem });
  },
);
export const clearCart = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }
  await Cart.deleteMany({ userId: userId.toString() });
  return res.json({ message: "Cart cleared" });
});
