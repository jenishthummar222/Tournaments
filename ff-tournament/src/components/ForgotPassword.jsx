import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  successToast,
  errorToast,
} from "../Utils/showToast";

const ForgotPassword = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  // SEND OTP
  const sendOtp = async () => {

    if (!email) {

      errorToast("Enter Email");

      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/send-forgot-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (data.message) {

        successToast("OTP Sent Successfully 📩");

        setStep(2);

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

  // VERIFY OTP + RESET PASSWORD
  const resetPassword = async () => {

    if (!otp || !newPassword) {

      errorToast("Fill All Fields");

      return;
    }

    if (newPassword.length < 6) {

      errorToast("Password must be 6+ characters");

      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (data.message) {

        successToast("Password Reset Successful 🔥");

        setTimeout(() => {

          navigate("/login");

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

    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center px-4 text-white">

      {/* Background Glow */}
      <div className="absolute top-0 left-[10%] w-96 h-96 bg-yellow-500/20 blur-[150px] rounded-full animate-pulse" />

      <div className="absolute bottom-0 right-[10%] w-[500px] h-[500px] bg-red-500/20 blur-[180px] rounded-full animate-pulse" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Form */}
      <div className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/5 border border-yellow-500/20 rounded-[35px] p-8 shadow-[0_0_60px_rgba(255,215,0,0.12)]">

        <h1 className="text-5xl font-black text-center mb-3 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
          RESET PASSWORD
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Recover your FF Arena account
        </p>

        {/* STEP 1 */}
        {step === 1 && (

          <>

            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-6 px-5 py-4 rounded-2xl bg-black/40 border border-gray-700 outline-none focus:border-yellow-400 transition-all"
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg hover:scale-105 transition-all duration-300"
            >

              {loading ? "SENDING..." : "SEND OTP"}

            </button>

          </>

        )}

        {/* STEP 2 */}
        {step === 2 && (

          <>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-4 px-5 py-4 rounded-2xl bg-black/40 border border-gray-700 outline-none focus:border-yellow-400 transition-all text-center tracking-[10px] text-2xl font-bold"
            />

            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mb-6 px-5 py-4 rounded-2xl bg-black/40 border border-gray-700 outline-none focus:border-yellow-400 transition-all"
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg hover:scale-105 transition-all duration-300"
            >

              {loading ? "RESETTING..." : "RESET PASSWORD"}

            </button>

          </>

        )}

        {/* Back */}
        <p className="text-center text-gray-400 mt-6">

          Back To{" "}

          <span
            onClick={() => navigate("/login")}
            className="text-yellow-400 cursor-pointer hover:underline"
          >
            Login
          </span>

        </p>

      </div>

    </div>

  );

};

export default ForgotPassword;