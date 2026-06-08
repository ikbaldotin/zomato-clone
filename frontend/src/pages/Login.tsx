import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";
const Login = () => {
  const { setUser, setIsAuth } = useAppData();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const responceGoogle = async (authResult: any) => {
    setLoading(true);
    console.log("Google Response:", authResult);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });
      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setIsAuth(true);
      setUser(result.data.user);
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("problem while login");
      setLoading(false);
    }
  };
  const googleLogin = useGoogleLogin({
    onSuccess: responceGoogle,
    onError: responceGoogle,
    flow: "auth-code",
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-3xl font-bold text-[#E23774]">
          Tomato
        </h1>
        <p className="text-center text-sm text-gray-500">
          Log in or Sign up to continue
        </p>
        <button
          onClick={googleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3"
        >
          <FcGoogle size={20} />
          {loading ? "Sign in....." : "Continue with google"}
        </button>
        <p className="text-center text-xs text-gray-500">
          By continuing ,you agree with our{" "}
          <span className="text-[#E23774]">Term of Service</span> & {}
        </p>
      </div>
    </div>
  );
};
export default Login;
