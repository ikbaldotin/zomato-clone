import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const Navbar = () => {
  const { isAuth, city, quantity } = useAppData();
  const currLocation = useLocation();
  const isHomePage = currLocation.pathname === "/";
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div
      className="w-full bg-white sticky top-0 z-50"
      style={{ boxShadow: "0 2px 12px rgba(226,55,68,0.08)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to={"/"} className="flex items-center gap-1 cursor-pointer group">
          <span className="text-2xl font-black tracking-tight text-[#E23744] transition-transform group-hover:scale-105 duration-200">
            🍅 Tomato
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          {/* Cart */}
          <Link
            to={"/cart"}
            className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-50 transition-colors duration-200"
          >
            <CgShoppingCart className="h-6 w-6 text-[#E23744]" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E23744] text-xs font-bold text-white shadow-sm">
              {quantity}
            </span>
          </Link>
          {/* Auth */}
          {isAuth ? (
            <Link
              to="/account"
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E23744] text-[#E23744] text-sm font-semibold hover:bg-[#E23744] hover:text-white transition-all duration-200"
            >
              Account
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E23744] text-white text-sm font-semibold hover:bg-[#c72f3a] transition-all duration-200 shadow-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {isHomePage && (
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
          <div className="mx-auto max-w-7xl flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-2 hover:border-[#E23744] transition-colors duration-200 focus-within:border-[#E23744] focus-within:ring-2 focus-within:ring-red-100">
            {/* Location */}
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200 shrink-0">
              <BiMapPin className="h-4 w-4 text-[#E23744]" />
              <span className="text-xs font-medium text-gray-600 max-w-[80px] truncate">
                {city}
              </span>
            </div>

            {/* Search */}
            <div className="flex flex-1 items-center gap-2">
              <BiSearch className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search for restaurants or dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>

            {/* Search Button */}
            {search && (
              <button className="shrink-0 px-3 py-1 bg-[#E23744] text-white text-xs font-semibold rounded-lg hover:bg-[#c72f3a] transition-colors duration-150">
                Search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
