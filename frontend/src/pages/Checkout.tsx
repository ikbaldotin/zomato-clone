import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { resturantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItems, IResturant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}
const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData();
  const [address, setAddress] = useState<Address[]>([]);
  const [selectAddressId, setSelectAddressId] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  useEffect(() => {
    const fetchAddress = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }
      try {
        const { data } = await axios.get(
          `${resturantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setAddress(data || null);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddress();
  }, [cart]);
  const navigate = useNavigate();
  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }
  const restaurant = cart[0].resturantId as IResturant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;
  const createOrder = async (paymentMethod: "razorpay") => {
    if (!selectAddressId) return null;
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${resturantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return data;
    } catch (error) {
      console.log(error);
      toast.error("failed to createOrder");
    } finally {
      setCreatingOrder(false);
    }
  };
  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const order = await createOrder("razorpay");
      if (!order) return;
      const { orderId, amount } = order;
      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });
      const { razorpayOrderId, key } = data;
      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Tomato",
        description: "Food order payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            toast.success("payment successFull");

            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            console.log(error);
            toast.error("payment verifycation faild");
          }
        },
        theme: {
          color: "#E23744",
        },
      };
      const razorpay = new (window as any)().Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("payment failded please refresh and try again");
    } finally {
      setLoadingRazorpay(false);
    }
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500">
          {restaurant.autoLocation.formattedAddress}
        </p>
        <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
          <h3 className="font-semibold">Delivery Address</h3>
          {loadingAddress ? (
            <p className="text-sm">Loading address</p>
          ) : address.length === 0 ? (
            <p className="text-sm text-gray-500">
              No Address Found please add one
            </p>
          ) : (
            address.map((add) => (
              <label
                key={add._id}
                className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition ${selectAddressId === add._id ? "border-[#e23744] bg-red-50" : "hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  checked={selectAddressId === add._id}
                  onChange={() => setSelectAddressId(add._id)}
                />
                <div>
                  <p className="text-sm font-medium">{add.formattedAddress}</p>
                  <p className="text-xs text-gray-500">{add.mobile}</p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h3 className="font-semibold">Order summary</h3>
        {cart.map((cartItem: ICart, idx: number) => {
          const item = cartItem.itemId as IMenuItems;
          return (
            <div className="flex justify-between text-sm" key={idx}>
              <span>
                {item.name}X{cartItem.quantity}
              </span>
              <span>₹${item.price * cartItem.quantity}</span>
            </div>
          );
        })}
        <hr />
        <div className="flex justify-between text-sm">
          <span>Items ({quantity}) </span>
          <span>₹${subTotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>DeliveryFee </span>
          <span>${deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>PlatFromfee </span>
          <span>₹${platformFee}</span>
        </div>
        {subTotal < 250 && (
          <p className="text-xs text-gray-500">
            Add Item worth ₹ {250 - subTotal} more to get free delivery
          </p>
        )}
        <div className="flex justify-between text-base font-semibold border-t pt-2">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Payment Method</h3>
        <button
          disabled={!selectAddressId || loadingRazorpay || creatingOrder}
          onClick={payWithRazorpay}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D7FF9] py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay with razorpay
        </button>
      </div>
    </div>
  );
};

export default Checkout;
