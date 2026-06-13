import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import { IMenuItem } from "../models/MenuItems.js";
import Order from "../models/Order.js";
import Resturant, { IResturant } from "../models/Resturant.js";

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { paymentMethod, addressId, distance } = req.body;
  if (!addressId) {
    return res
      .status(400)
      .json({ message: "Payment method and address id are required" });
  }
  const address = await Address.findOne({
    _id: addressId,
    userId: user._id.toString(),
  });
  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }
  const cartItem = await Cart.find({ userId: user._id.toString() })
    .populate<{ itemId: IMenuItem }>("itemId")
    .populate<{ resturantId: IResturant }>("resturantId");
  if (cartItem.length == 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }
  const firstCartItem = cartItem[0];
  if (!firstCartItem || !firstCartItem.resturantId) {
    return res.status(400).json({ message: "Cart is empty" });
  }
  const resturantId = firstCartItem.resturantId._id;
  const resturant = await Resturant.findById(resturantId);
  if (!resturant) {
    return res.status(404).json({ message: "Resturant not found" });
  }
  if (!resturant.isOpen) {
    return res
      .status(400)
      .json({ message: "sorry this resturant is not open" });
  }
  let subTotal = 0;
  const orderItems = cartItem.map((cart) => {
    const item = cart.itemId;
    if (!item) {
      throw new Error("Item not found");
    }
    const itemTotal = item.price * cart.quantity;
    subTotal += itemTotal;
    return {
      itemId: item._id.toString(),
      name: item.name,
      price: item.price,
      quantity: cart.quantity,
    };
  });
  const deliveryFee = subTotal < 250 ? 50 : 0;
  const platformFee = 7;
  const totalAmount = subTotal + deliveryFee + platformFee;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const [longitude, latitude] = address.location.coordinates;
  const riderAmount = Math.ceil(distance) * 17;
  const order = await Order.create({
    userId: user._id.toString(),
    resturantId: resturantId.toString(),
    resturantName: resturant.name,
    riderId: null,
    items: orderItems,
    subtotal: subTotal,
    deliveryFee,
    platformFee,
    totalAmount,
    addressId: address._id.toString(),
    deliveryAddress: {
      formattedAddress: address.formattedAddress,
      mobile: address.mobile,
      latitude,
      longitude,
    },
    riderAmount,
    distance,
    paymentMethod,
    paymentStatus: "pending",
    status: "placed",
    expiresAt,
  } as any);
  await Cart.deleteMany({ userId: user._id.toString() });
  res.json({
    message: "Order created successfully",
    ownerId: order._id.toString(),
    amount: totalAmount,
    order,
  });
});

export const fetchOrderForPaymen = TryCatch(async (req, res) => {
  if (
    req.headers["x-restaurant-secret"] !== process.env.INTERNAL_SERVICE_SECRET
  ) {
    return res.status(401).json({ message: "Forbidden" });
  }
  const orderId = req.params.id;
  const order = (await Order.findById(orderId)) as any;
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.paymentStatus !== "pending") {
    return res
      .status(400)
      .json({ message: "Payment already processed for this order" });
  }
  res.json({
    orderId: order._id.toString(),
    amount: order.totalAmount,
    currency: "INR",
  });
});
