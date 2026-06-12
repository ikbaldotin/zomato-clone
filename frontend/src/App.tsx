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
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
