import { useEffect, useState } from "react";
import { type IMenuItems, type IResturant } from "../types";
import { resturantService } from "../main";
import AddRestaurant from "../components/addResturant";

import axios from "axios";
import RestaurantProfile from "../components/ResturantProfile";
import AddMenuItems from "../components/AddMenuItems";
import MenuItems from "../components/MenuItems";

type SellerTab = "menu" | "add-item" | "sales";
const Resturant = () => {
  const [restaurant, setRestaurant] = useState<IResturant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("menu");
  const fetchMyResturant = async () => {
    try {
      const { data } = await axios.get(`${resturantService}/api/resturant/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRestaurant(data.restaurant || null);
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMyResturant();
  }, []);
  const [menuItems, setMenuItems] = useState<IMenuItems[]>([]);
  const fecthMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(
        `${resturantService}/api/item/all/:${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (restaurant?._id) {
      fecthMenuItems(restaurant._id);
    }
  }, [restaurant]);
  if (loading) return <div>loading..............</div>;
  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyResturant} />;
  }
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={true}
      />
      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex border-b">
          {[
            { key: "menu", label: "Menu Items" },
            { key: "add-item", label: "Add Items" },
            { key: "sales", label: "Sales" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as SellerTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${tab === t.key ? "border-b-2 border-red-500 text-red-500" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "menu" && (
            <MenuItems
              items={menuItems}
              onitemDeleted={() => fecthMenuItems(restaurant._id)}
              isSeller={true}
            />
          )}
          {tab === "add-item" && (
            <AddMenuItems onItemAdded={() => fecthMenuItems(restaurant._id)} />
          )}
          {tab === "sales" && <p>Sales Page</p>}
        </div>
      </div>
    </div>
  );
};
export default Resturant;
