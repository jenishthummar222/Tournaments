
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  successToast,
  errorToast,
} from "../utils/showToast";

import {
  Flame,
  Shield,
  Swords,
  Bomb,
  Gamepad2,
} from "lucide-react";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    if (!email || !password) {

      errorToast("Please fill all fields");

      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.token) {

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "lastActivity",
          Date.now()
        );

        successToast("Login Successful 🎮");

        setTimeout(() => {

          navigate("/dashboard", {
            replace: true,
          });

        }, 1200);

      }

      else {

        errorToast(data.error);
      }

    }

    catch (error) {

      errorToast("Server Error");
    }

    finally {

      setLoading(false);
    }

  };

  return (

    <div className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-4">

      {/* Animated Gaming Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(255,180,0,0.18), transparent 35%), radial-gradient(circle at bottom, rgba(255,0,0,0.15), transparent 35%)"
        }}
      />

      {/* Moving Fire Effect */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-0 left-[10%] w-72 h-72 bg-orange-500/20 blur-[120px] rounded-full animate-pulse" />

        <div className="absolute bottom-0 right-[15%] w-96 h-96 bg-red-500/20 blur-[150px] rounded-full animate-pulse" />

        <div className="absolute top-[30%] left-[45%] w-80 h-80 bg-yellow-400/10 blur-[140px] rounded-full animate-ping" />

      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Smoke Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/80" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-[10%] left-[20%] w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />

        <div className="absolute top-[40%] left-[70%] w-3 h-3 bg-orange-500 rounded-full animate-ping" />

        <div className="absolute bottom-[20%] left-[40%] w-2 h-2 bg-red-500 rounded-full animate-bounce" />

        <div className="absolute top-[70%] right-[25%] w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />

      </div>

      {/* Floating Icons */}
      <Flame className="absolute top-16 left-10 text-orange-500 w-14 h-14 animate-bounce" />

      <Bomb className="absolute bottom-20 left-20 text-red-500 w-12 h-12 animate-pulse" />

      <Shield className="absolute top-24 right-14 text-yellow-400 w-12 h-12 animate-spin" />

      <Swords className="absolute bottom-24 right-20 text-white w-14 h-14 animate-bounce" />

      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/5 border border-yellow-500/20 rounded-[35px] p-8 shadow-[0_0_80px_rgba(255,215,0,0.15)]"
      >

        {/* Logo */}
        <div className="flex justify-center mb-6">

          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.5)] animate-pulse">

            <Gamepad2 className="w-12 h-12 text-black" />

          </div>

        </div>

        {/* Title */}
        <h1 className="text-5xl font-black text-center bg-gradient-to-r from-yellow-300 to-orange-500 bg-clip-text text-transparent mb-3 tracking-wide">
          FF ARENA
        </h1>

        <p className="text-center text-gray-400 mb-8 text-sm tracking-wide">
          Enter the battlefield and dominate tournaments.
        </p>

        {/* Email */}
        <div className="mb-5">

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-2xl px-5 py-4 outline-none transition-all duration-300 focus:shadow-[0_0_25px_rgba(255,215,0,0.4)]"
          />

        </div>

        {/* Password */}
        <div className="mb-7">

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-2xl px-5 py-4 outline-none transition-all duration-300 focus:shadow-[0_0_25px_rgba(255,215,0,0.4)]"
          />

        </div>

        <div className="flex justify-end mb-6">

          <span
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-yellow-400 cursor-pointer hover:text-yellow-300 hover:underline transition-all"
          >
            Forgot Password?
          </span>

        </div>
        
        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="relative overflow-hidden group w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 rounded-2xl font-black text-lg tracking-wide hover:scale-105 transition-all duration-300 shadow-[0_0_35px_rgba(255,215,0,0.4)]"
        >

          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-700" />

          <span className="relative z-10">
            {loading ? "CONNECTING..." : "ENTER BATTLE"}
          </span>

        </button>

        {/* Bottom Text */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Secure Login • Instant Match Access • Fast UPI Withdrawals
        </p>

      </form>

    </div>
  );
}

