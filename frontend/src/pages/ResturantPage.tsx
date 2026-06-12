import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItems, IRestaurant } from "../types";
import axios from "axios";
import { resturantService } from "../main";

import MenuItems from "../components/MenuItems";

const ResturantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItems[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchResturant = async () => {
    try {
      const { data } = await axios.get(
        `${resturantService}/api/resturant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setRestaurant(data || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const fecthMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${resturantService}/api/item/all/${id}`,
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
    if (id) {
      fetchResturants();
      fecthMenuItems();
    }
  }, [id]);
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading restaurant ... </p>
      </div>
    );
  }
  if (!restaurant) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">No restaurant with this id</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-3 space-y-6">
      {/* <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={false}
      /> */}
      <div className="rounded-xl bg-white shadow-sm p-4">
        <MenuItems
          isSeller={false}
          items={menuItems}
          onitemDeleted={() => {}}
        />
      </div>
    </div>
  );
};

export default ResturantPage;
