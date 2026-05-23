import {

  useEffect,
  useState

} from "react";

import {

  CheckCircle,
  RotateCcw

} from "lucide-react";

import {

  successToast,
  errorToast

} from "../../Utils/showToast";

const WithdrawRequests = () => {

  const [requests, setRequests] = useState([]);

  // =========================
  // FETCH
  // =========================

  const fetchRequests = async () => {

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/withdraw-requests`,

        {

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          }

        }

      );

      const data = await response.json();

      setRequests(

        Array.isArray(data)
        ? data
        : []

      );

    }

    catch {

      errorToast("Failed to load requests");

      setRequests([]);

    }

  };

  useEffect(() => {

    fetchRequests();

  }, []);

  // =========================
  // APPROVE
  // =========================

  const approveRequest = async (id) => {

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/approve-withdraw/${id}`,

        {

          method: "POST",

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          }

        }

      );

      const data = await response.json();

      if (data.error) {

        errorToast(data.error);

        return;

      }

      successToast(data.message);

      fetchRequests();

    }

    catch {

      errorToast("Approval failed");

    }

  };

  // =========================
  // RETRY
  // =========================

  const retryRequest = async (id) => {

    const reason = prompt(

      "Enter retry reason"

    );

    if (!reason) return;

    try {

      const formData = new FormData();

      formData.append(

        "reason",
        reason

      );

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/retry-withdraw/${id}`,

        {

          method: "POST",

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          },

          body: formData

        }

      );

      const data = await response.json();

      if (data.error) {

        errorToast(data.error);

        return;

      }

      successToast(data.message);

      fetchRequests();

    }

    catch {

      errorToast("Retry failed");

    }

  };

  return (

  <div className="space-y-4 sm:space-y-6 overflow-x-hidden px-2 sm:px-0">

    <h1
      className="
      text-2xl sm:text-4xl
      font-black
      text-red-400
      "
    >

      WITHDRAW REQUESTS

    </h1>

    {

      requests.length === 0 && (

        <div
          className="
          rounded-3xl
          border
          border-red-500/10
          bg-white/5
          p-5 sm:p-6
          text-center
          text-gray-400
          "
        >

          No withdraw requests found

        </div>

      )

    }

    {

      requests.map((request) => (

        <div

          key={request._id}

          className="
          bg-white/5
          border
          border-red-500/10
          rounded-3xl
          p-4 sm:p-6
          backdrop-blur-xl
          overflow-hidden
          "

        >

          <div
            className="
            flex
            flex-col
            gap-4
            "
          >

            {/* TOP */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <h2
                className="
                text-lg sm:text-2xl
                font-black
                text-white
                break-all
                "
              >

                {request.email}

              </h2>

              <span
                className={`
                px-4 py-2 rounded-2xl text-sm sm:text-base font-black w-fit
                ${
                  request.status === "pending"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : request.status === "approved"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }
                `}
              >

                {request.status.toUpperCase()}

              </span>

            </div>

            {/* AMOUNT */}
            <p
              className="
              text-red-400
              text-2xl sm:text-4xl
              font-black
              "
            >

              ₹{request.amount}

            </p>

            {/* INFO GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="rounded-2xl bg-black/30 border border-red-500/10 p-4">

                <p className="text-gray-500 text-xs sm:text-sm mb-1">

                  UPI ID

                </p>

                <p className="text-gray-200 break-all">

                  {request.upi_id}

                </p>

              </div>

              <div className="rounded-2xl bg-black/30 border border-red-500/10 p-4">

                <p className="text-gray-500 text-xs sm:text-sm mb-1">

                  REQUEST TIME

                </p>

                <p className="text-gray-200 text-sm sm:text-base">

                  {new Date(
                    request.created_at
                  ).toLocaleString()}

                </p>

              </div>

            </div>

            {/* REASON */}
            {

              request.reason && (

                <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-4">

                  <p className="text-yellow-400 font-bold mb-1">

                    Retry Reason

                  </p>

                  <p className="text-gray-300 break-words">

                    {request.reason}

                  </p>

                </div>

              )

            }

            {/* ACTION BUTTONS */}
            {

              request.status === "pending" && (

                <div
                  className="
                  flex
                  flex-col sm:flex-row
                  gap-3 sm:gap-4
                  mt-2
                  "
                >

                  {/* APPROVE */}
                  <button

                    onClick={() =>

                      approveRequest(
                        request._id
                      )

                    }

                    className="
                    w-full sm:w-auto justify-center
                    flex
                    items-center
                    gap-2
                    bg-green-500
                    hover:bg-green-600
                    text-black
                    px-5
                    py-3
                    rounded-2xl
                    font-black
                    transition-all
                    "

                  >

                    <CheckCircle size={20} />

                    Approve

                  </button>

                  {/* RETRY */}
                  <button

                    onClick={() =>

                      retryRequest(
                        request._id
                      )

                    }

                    className="
                    w-full sm:w-auto justify-center
                    flex
                    items-center
                    gap-2
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    font-black
                    transition-all
                    "

                  >

                    <RotateCcw size={20} />

                    Retry

                  </button>

                </div>

              )

            }

          </div>

        </div>

      ))

    }

  </div>

);

};

export default WithdrawRequests;
