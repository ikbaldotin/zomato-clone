import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const firstLetter = user?.name.charAt(0).toUpperCase();
  const navigate = useNavigate();
  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("logout successfully");
  };
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-4">
        {/* Profile Card */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-[#E23744] to-[#ff6b6b]" />

          {/* Avatar + Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-8 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E23744] text-2xl font-bold text-white ring-4 ring-white shadow-md">
                {firstLetter}
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Menu Card */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
          {/* Orders */}
          <button
            onClick={() => navigate("/order")}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition-colors duration-150 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
              <BiPackage className="h-5 w-5 text-[#E23744]" />
            </div>
            <span className="flex-1 text-left font-medium text-gray-700">
              Your Orders
            </span>
            <span className="text-gray-300 text-lg">›</span>
          </button>

          {/* Addresses */}
          <button
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition-colors duration-150 group"
            onClick={() => navigate("/address")}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
              <BiMapPin className="h-5 w-5 text-[#E23744]" />
            </div>
            <span className="flex-1 text-left font-medium text-gray-700">
              Saved Addresses
            </span>
            <span className="text-gray-300 text-lg">›</span>
          </button>
        </div>

        {/* Logout Card */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition-colors duration-150 group"
            onClick={logoutHandler}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
              <BiLogOut className="h-5 w-5 text-[#E23744]" />
            </div>
            <span className="flex-1 text-left font-medium text-red-500">
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Account;
