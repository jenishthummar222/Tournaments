import { useEffect, useState } from "react";

import {
  requestNotificationPermission
} from "./firebase";

const NotificationPermission = () => {

  const [showPopup, setShowPopup] = useState(false);

  // =========================
  // SHOW POPUP
  // =========================
  useEffect(() => {

    const notificationStatus =
      Notification.permission;

    // SHOW ONLY IF NOT DECIDED
    if (notificationStatus === "default") {

      setShowPopup(true);

    }

  }, []);

  // =========================
  // ENABLE NOTIFICATIONS
  // =========================
  const enableNotifications = async () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {

        alert("Login Required");

        return;

      }

      // REQUEST PERMISSION
      const fcmToken =
        await requestNotificationPermission();

      if (!fcmToken) {

        alert("Notification Permission Denied");

        return;

      }

      // SAVE TOKEN
      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/save-fcm-token`,

        {

          method: "POST",

          headers: {

            "Content-Type":
            "application/json",

            Authorization:
            `Bearer ${token}`

          },

          body: JSON.stringify({

            fcm_token: fcmToken

          })

        }

      );

      const data = await response.json();

      console.log(data);

      alert("Notifications Enabled");

      setShowPopup(false);

    }

    catch (err) {

      console.log(err);

      alert("Notification Setup Failed");

    }

  };

  // =========================
  // CLOSE POPUP
  // =========================
  const closePopup = () => {

    setShowPopup(false);

  };

  // =========================
  // UI
  // =========================
  if (!showPopup) return null;

  return (

    <div
      className="
      fixed
      bottom-5
      left-4
      right-4
      sm:left-auto
      sm:right-5
      sm:w-[400px]
      z-50
      "
    >

      <div
        className="
        bg-black/95
        backdrop-blur-xl
        border
        border-yellow-400/30
        rounded-3xl
        p-6
        shadow-2xl
        "
      >

        {/* TITLE */}
        <h2
          className="
          text-2xl
          font-black
          text-yellow-400
          mb-3
          "
        >

          Enable Notifications

        </h2>

        {/* TEXT */}
        <p
          className="
          text-gray-300
          leading-relaxed
          mb-6
          "
        >

          Get tournament updates,
          room IDs, match results
          and wallet alerts instantly.

        </p>

        {/* BUTTONS */}
        <div
          className="
          flex
          flex-col
          sm:flex-row
          gap-3
          "
        >

          {/* ALLOW */}
          <button

            onClick={enableNotifications}

            className="
            w-full
            py-3
            rounded-2xl
            bg-yellow-400
            text-black
            font-black
            hover:scale-[1.02]
            transition-all
            "

          >

            Allow Notifications

          </button>

          {/* LATER */}
          <button

            onClick={closePopup}

            className="
            w-full
            py-3
            rounded-2xl
            bg-white/10
            text-white
            font-black
            hover:bg-white/20
            transition-all
            "

          >

            Maybe Later

          </button>

        </div>

      </div>

    </div>

  );

};

export default NotificationPermission;