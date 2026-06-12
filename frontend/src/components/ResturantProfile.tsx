import { useState } from "react";
import type { IResturant } from "../types";
import axios from "axios";
import { resturantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";

interface props {
  restaurant: IResturant;
  isSeller: boolean;
  onUpdate: (restaurant: IResturant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);
  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${resturantService}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response.data.message);
    }
  };
  const saveChange = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${resturantService}/api/restaurant/edit`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      onUpdate(data.restaurant);
      toast.success(data.message);
      setEditMode(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-xl rounded-xl bg-white shadow-sm overflow-hidden">
      {restaurant.image && (
        <img
          src={restaurant.image}
          alt=""
          className="h-48 w-full object-cover"
        />
      )}
      <div className="p-5 space-y-4">
        {isSeller && (
          <div className="flex items-start justify-between">
            <div>
              {editMode ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border px-2 py-1 text-lg font-semibold"
                />
              ) : (
                <h1 className="text-xl font-semibold">{restaurant.name}</h1>
              )}
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <BiMapPin className="h-4 w-4 text-red-500" />
                {restaurant.autoLocation.formattedAddress ||
                  "Location unavilable"}
              </div>
            </div>
            {isSeller && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-gray-500 hover:text-black"
              >
                <BiEdit size={18} />
              </button>
            )}
          </div>
        )}
        {!isSeller && (
          <h1 className="text-xl font-semibold">{restaurant.name}</h1>
        )}
        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        ) : (
          <p className="text-sm text-gray-600">
            {restaurant.description || "no description added"}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t">
          <span
            className={`text-sm font-medium ${isOpen ? "text-green-600" : "text-red-500"}`}
          >
            {isOpen ? "OPEN" : "CLOSE"}
          </span>
          <div className="flex gap-3">
            {editMode && (
              <button
                onClick={saveChange}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                <BiSave size={16} />
                Save
              </button>
            )}
            {isSeller && (
              <button
                onClick={toggleOpenStatus}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white ${
                  isOpen
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isOpen ? "Close Restaurant" : "Open Restaurant"}
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Created on{new Date(restaurant.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default RestaurantProfile;
