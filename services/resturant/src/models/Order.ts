import mongoose, { Schema, Document } from "mongoose";
export interface IOrder extends Document {
  userId: string;
  resturantId: string;
  resturantName: string;
  riderId?: string | null;
  riderPhone: number | null;
  riderName: string | null;
  dishtance: number;
  riderAmount: number;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  addressId: string;
  deliveryAddress: {
    formattedAddress: string;
    mobile: number;
    latitude: number;
    longitude: number;
  };
  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_order"
    | "rider_assigned"
    | "picked_up"
    | "delivered"
    | "cancelled";
  paymentMethod: "razorpay" | "stripe";
  paymentStatus: "pending" | "paid" | "failed";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    resturantId: { type: String, required: true },
    resturantName: { type: String, required: true },
    riderId: { type: String, default: null },
    riderPhone: { type: Number, default: null },
    riderName: { type: String, default: null },
    riderAmount: { type: Number, required: true },
    dishtance: { type: Number, required: true },
    items: [
      {
        itemId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    subtotal: Number,
    deliveryFee: Number,
    platformFee: Number,
    addressId: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      formattedAddress: { type: String, required: true },
      mobile: { type: Number, required: true },
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready_for_order",
        "rider_assigned",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true },
);

export default mongoose.model<IOrder>("Order", OrderSchema);
