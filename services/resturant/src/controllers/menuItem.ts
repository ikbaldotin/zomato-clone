import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import MenuItems from "../models/MenuItems.js";
import Resturant from "../models/Resturant.js";
import axios from "axios";
export const addMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const resturant = await Resturant.findOne({
    ownerId: user._id.toString(),
  });
  if (!resturant) {
    return res.status(404).json({
      message: "Restaurant not found",
    });
  }
  const { name, description, price } = req.body;
  if (!name || !description || !price) {
    return res.status(400).json({
      message: "Name, description and price are required",
    });
  }
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      message: "Please upload an image",
    });
  }
  const fileBuffer = getBuffer(file);
  if (!fileBuffer?.content) {
    return res.status(500).json({
      message: "failed to create file buffer",
    });
  }
  const { data: uploadResult } = await axios.post(
    `${process.env.UTILS_SERVER}/api/upload`,
    {
      buffer: fileBuffer.content,
    },
  );
  const menuItem = await MenuItems.create({
    name,
    description,
    price,
    resturantId: resturant._id,
    image: uploadResult.url,
  });
  res.json({
    message: "Item added successfully",
    menuItem,
  });
});

export const getAllItems = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      message: "Resturant id is required",
    });
  }
  const items = await MenuItems.find({ resturantId: id });
  res.json({ items });
});

export const deleteMenuItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        message: "Resturant id is required",
      });
    }
    const item = await MenuItems.findById(itemId);
    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }
    const resturant = await Resturant.findOne({
      _id: item.resturantId,
      ownerId: user._id.toString(),
    });
    if (!resturant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }
    await MenuItems.deleteOne();
    res.json({
      message: "Item deleted successfully",
    });
  },
);

export const toggleMenuItemAvailability = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        message: "Resturant id is required",
      });
    }
    const item = await MenuItems.findById(itemId);
    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }
    const resturant = await Resturant.findOne({
      _id: item.resturantId,
      ownerId: user._id.toString(),
    });
    if (!resturant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({
      message: `Item is now ${item.isAvailable ? "available" : "unavailable"}`,
      item,
    });
  },
);
