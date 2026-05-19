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

} from "../../utils/showToast";

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

    <div className="space-y-6">

      <h1
        className="
        text-4xl
        font-black
        text-red-400
        "
      >

        WITHDRAW REQUESTS

      </h1>

      {

        requests.map((request) => (

          <div

            key={request._id}

            className="
            bg-white/5
            border
            border-red-500/10
            rounded-3xl
            p-6
            "

          >

            <div
              className="
              flex
              flex-col
              gap-4
              "
            >

              <h2
                className="
                text-2xl
                font-black
                text-white
                "
              >

                {request.email}

              </h2>

              <p
                className="
                text-red-400
                text-2xl
                font-black
                "
              >

                ₹{request.amount}

              </p>

              <p className="text-gray-300">

                UPI ID:
                {" "}
                {request.upi_id}

              </p>

              <p className="text-gray-300">

                Status:
                {" "}
                {request.status}

              </p>

              {

                request.reason && (

                  <p className="text-yellow-400">

                    Reason:
                    {" "}
                    {request.reason}

                  </p>

                )

              }

              <p className="text-gray-500 text-sm">

                {new Date(
                  request.created_at
                ).toLocaleString()}

              </p>

              {

                request.status === "pending" && (

                  <div
                    className="
                    flex
                    gap-4
                    mt-4
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
                      flex
                      items-center
                      gap-2
                      bg-green-500
                      text-black
                      px-5
                      py-3
                      rounded-2xl
                      font-black
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
                      flex
                      items-center
                      gap-2
                      bg-red-500
                      text-white
                      px-5
                      py-3
                      rounded-2xl
                      font-black
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
