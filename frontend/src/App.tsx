import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";

import ProtectRoutes from "./components/protectedRoutes";
import PublicRoutes from "./components/publicRoutes";
import SelectRole from "./pages/SelectRole";
import Navbar from "./context/navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Resturant from "./pages/Resturant";
import ResturantPage from "./pages/ResturantPage";
import Cart from "./pages/Cart";
import Address from "./pages/Address";
import Checkout from "./pages/Checkout";
function App() {
  const { user } = useAppData();
  if (user && user.role === "seller") {
    return <Resturant />;
  }
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/address" element={<Address />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/resturant/:id" element={<ResturantPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
