import Order from "../models/Order.js";
import { getChannel } from "./rabbitmq.js";

export const startPaymentConsume = async () => {
  const channel = getChannel();
  channel.consume(process.env.PAYMENT_QUEUE!, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      if (event.type !== "PAYMENT_SUCCESS") {
        channel.ack(msg);
        return;
      }
      const { orderId } = event.data;
      const order = await Order.findOneAndUpdate(
        {
          _id: orderId.toString(),
          paymentStatus: { $ne: "paid" },
        },
        {
          $set: {
            paymentStatus: "paid",
            status: "placed",
          },
          $unset: {
            expiresAt: 1,
          },
        },
        { new: true },
      );
      if (!order) {
        channel.ack(msg);
        return;
      }
      console.log(`Payment success for order ${orderId}`);
      //socket.emit("orderPlaced", order);
      channel.ack(msg);
    } catch (error) {
      console.error("Error processing payment success event:", error);
    }
  });
};
