import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  successToast,
  errorToast,
} from "../Utils/showToast";

export default function Register() {

  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");

  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(300);
  const [showOtpBox, setShowOtpBox] = useState(false);

  const [loading, setLoading] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [showTerms, setShowTerms] = useState(false);

  // STEP 1
  // SEND OTP
  const handleRegister = async (e) => {

    const formData = new FormData();

    formData.append("name", name);
    formData.append("mobile", mobile);
    formData.append("email", email);
    formData.append("password", password);

    formData.append(
      "profile_pic",
      profilePic
    );

    e.preventDefault();

    if (!name || !mobile || !email || !password) {

      errorToast("Please fill all fields");

      return;
    }

    if (password.length < 6) {

      errorToast("Password must be 6+ characters");

      return;
    }

    if (!acceptedTerms) {

      errorToast("Please accept Terms & Conditions");

      return;

    }

    try {

      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/send-otp`,
        {
          method: "POST",

          body: formData,
        }
      );

      const data = await response.json();

      if (data.message) {

        successToast("OTP Sent To Your Email 📩");
        setOtpTimer(300);
        setShowOtpBox(true);

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

  // STEP 2
  // VERIFY OTP
  const verifyOtp = async () => {

    if (!otp) {

      errorToast("Enter OTP");

      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
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
          "loginTime",
          Date.now()
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        successToast("Account Created Successfully 🔥");

        setTimeout(() => {

          navigate("/dashboard", {
            replace: true
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

  useEffect(() => {

  let interval;

  if (showOtpBox && otpTimer > 0) {

    interval = setInterval(() => {

      setOtpTimer((prev) => prev - 1);

    }, 1000);

  }

  return () => clearInterval(interval);

}, [showOtpBox, otpTimer]);

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
      <form
        onSubmit={handleRegister}
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/5 border border-yellow-500/20 rounded-[35px] p-8 shadow-[0_0_60px_rgba(255,215,0,0.12)]"
      >

        <h1 className="text-5xl font-black text-center mb-3 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
          CREATE ACCOUNT
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Join the battlefield today
        </p>

        {/* Profile Pic */}
        <div className="flex flex-col items-center mb-6">

          <label className="relative cursor-pointer">

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {

                const file = e.target.files[0];

                  if (file) {

                    setProfilePic(file);

                    setPreview(
                      URL.createObjectURL(file)
                    );

                  }
              }}
            />

            <div className="w-28 h-28 rounded-full border-4 border-yellow-400 overflow-hidden bg-black/40 flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.25)]">

              {profilePic ? (

                <img
                  src={preview}
                  alt="profile"
                  className="w-full h-full object-cover"
                />

              ) : (

                <span className="text-gray-400 text-sm text-center px-2">
                  Upload
                  <br />
                  Profile
                </span>

              )}

            </div>

          </label>

        </div>

        {/* Name */}
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-5 py-4 rounded-2xl bg-black/40 border border-gray-700 outline-none focus:border-yellow-400 transition-all"
        />

        {/* Mobile */}
        <div className="flex mb-4">

          {/* Country Code */}
          <div className="px-5 py-4 rounded-l-2xl bg-yellow-400 text-black font-bold flex items-center">

            +91

          </div>

          {/* Mobile Input */}
          <input
            type="tel"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={(e) => {

              const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

              setMobile(value);

            }}
            className="w-full px-5 py-4 rounded-r-2xl bg-black/40 border border-gray-700 outline-none focus:border-yellow-400 transition-all"
            inputMode="numeric"
          />

        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-5 py-4 rounded-2xl bg-black/40 border border-gray-700 outline-none focus:border-yellow-400 transition-all"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-5 py-4 rounded-2xl bg-black/40 border border-gray-700 outline-none focus:border-yellow-400 transition-all"
        />

        {/* TERMS */}
        <div className="mb-6">

          <label className="flex items-start gap-3 cursor-pointer">

            <input

              type="checkbox"

              checked={acceptedTerms}

              onChange={(e) =>

                setAcceptedTerms(e.target.checked)

              }

              className="
              mt-1
              w-5
              h-5
              accent-yellow-400
              cursor-pointer
              "

            />

            <span className="text-gray-300 text-sm leading-relaxed">

              I agree to the{" "}

              <span

                onClick={() => setShowTerms(true)}

                className="
                text-yellow-400
                font-semibold
                hover:underline
                "

              >

                Terms & Conditions

              </span>

            </span>

          </label>

        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,215,0,0.3)]"
        >

          {loading ? "SENDING OTP..." : "REGISTER"}

        </button>

        {/* Login */}
        <p className="text-center text-gray-400 mt-6">

          Already have account?{" "}

          <span
            onClick={() => navigate("/login")}
            className="text-yellow-400 cursor-pointer hover:underline"
          >
            Login
          </span>

        </p>

      </form>

      {/* OTP POPUP */}
      {showOtpBox && (

        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="w-full max-w-sm bg-gray-900 border border-yellow-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,215,0,0.15)] animate-pulse relative">

            {/* Close Button */}
            <button
              onClick={() => {

                setShowOtpBox(false);

                setOtp("");

              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-3xl font-black text-center text-yellow-400 mb-3">
              VERIFY OTP
            </h2>

            {/* User Email */}
            <p className="text-center text-gray-400 mb-2">
              Enter OTP sent to
            </p>

            <p className="text-center text-yellow-400 font-semibold mb-6 break-all">
              {email}
            </p>

            {/* Timer */}
            <p className="text-center text-red-400 font-bold mb-6">

              OTP Expires In : {" "}

              {Math.floor(otpTimer / 60)}
              :
              {String(otpTimer % 60).padStart(2, "0")}

            </p>

            {/* OTP INPUT */}
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full mb-5 px-5 py-4 rounded-2xl bg-black/40 border border-gray-700 outline-none focus:border-yellow-400 transition-all text-center tracking-[10px] text-2xl font-bold"
            />

            {/* Verify Button */}
            <button
              onClick={verifyOtp}
              disabled={loading || otpTimer <= 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg hover:scale-105 transition-all duration-300"
            >

              {otpTimer <= 0
                ? "OTP EXPIRED"
                : loading
                ? "VERIFYING..."
                : "VERIFY OTP"}

            </button>

            {/* Back Button */}
            <button
              onClick={() => {

                setShowOtpBox(false);

                setOtp("");

              }}
              className="w-full mt-4 py-3 rounded-2xl border border-gray-700 text-gray-300 hover:bg-white/10 transition-all duration-300"
            >
              BACK TO REGISTER
            </button>

          </div>

        </div>

        )
      }
      {/* TERMS MODAL */}
      {

        showTerms && (

          <div
            className="
            fixed
            inset-0
            bg-black/80
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
            p-4
            "
          >

            <div
              className="
              w-full
              max-w-3xl
              max-h-[85vh]
              overflow-y-auto
              rounded-3xl
              bg-gray-900
              border
              border-yellow-500/20
              p-8
              scrollbar-hide
              "
            >

              {/* HEADER */}
              <div className="flex items-center justify-between mb-6">

                <h2 className="text-3xl font-black text-yellow-400">

                  Terms & Conditions

                </h2>

                <button

                  onClick={() => setShowTerms(false)}

                  className="
                  text-3xl
                  text-gray-400
                  hover:text-red-400
                  "

                >

                  ×

                </button>

              </div>

              {/* CONTENT */}
              <div className="space-y-5 text-gray-300 leading-relaxed">

                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    1. Fair Play Policy

                  </h3>

                  <p>

                    Hacking, cheating, teaming, emulator abuse,
                    exploit usage, or unfair gameplay can result
                    in permanent account suspension without warning.

                  </p>

                </div>

                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    2. No Refund Policy

                  </h3>

                  <p>

                    Entry fees are non-refundable once a tournament
                    has started or room details are shared.

                  </p>

                </div>

                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    3. Payment Verification

                  </h3>

                  <p>

                    Fake payment screenshots, edited receipts,
                    chargebacks, or fraudulent transactions may
                    result in permanent bans and legal action.

                  </p>

                </div>

                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    4. Account Responsibility

                  </h3>

                  <p>

                    Users are responsible for maintaining account
                    security and protecting login credentials.

                  </p>

                </div>

                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    5. Tournament Changes

                  </h3>

                  <p>

                    FF Arena reserves the right to cancel,
                    reschedule, modify prize pools, or adjust
                    match timings if required.

                  </p>

                </div>

                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    6. Prize Distribution

                  </h3>

                  <p>

                    Winnings may take up to 24 hours to process
                    after result verification.

                  </p>

                </div>

                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    7. User Conduct

                  </h3>

                  <p>

                    Abusive language, threats, harassment,
                    impersonation, or toxic behavior can result
                    in account restrictions.

                  </p>

                </div>

                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    8. Age Requirement

                  </h3>

                  <p>

                    Users must follow local laws and age
                    requirements related to online gaming
                    and tournaments.

                  </p>

                </div>

                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    9. Platform Rights

                  </h3>

                  <p>

                    FF Arena may suspend accounts, remove users,
                    or deny access to protect platform integrity
                    and community safety.

                  </p>

                </div>
                <div>

                  <h3 className="text-yellow-400 font-bold mb-2">

                    10. Intellectual Property Rights

                  </h3>

                  <p>

                    All platform content including design,
                    UI, logos, branding, source code,
                    tournament systems, graphics,
                    databases, and functionality belong
                    exclusively to FF Arena.

                    Unauthorized copying, cloning,
                    redistribution, resale, reverse engineering,
                    or reproduction of this platform
                    is strictly prohibited and may lead
                    to legal action.

                  </p>

                </div>

              </div>

              {/* BUTTON */}
              <button

                onClick={() => {

                  setAcceptedTerms(true);

                  setShowTerms(false);

                }}

                className="
                mt-8
                w-full
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-yellow-400
                to-orange-500
                text-black
                font-black
                hover:scale-[1.02]
                transition-all
                "

              >

                ACCEPT TERMS

              </button>

            </div>

          </div>

        )

      }

    </div>

  );
}