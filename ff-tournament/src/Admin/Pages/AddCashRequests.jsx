import {

  useEffect,
  useState

} from "react";

import { CheckCircle, RotateCcw, Pencil } from "lucide-react";

import {

  successToast,
  errorToast

} from "../../Utils/showToast";

const AddCashRequests = () => {

  const [requests, setRequests] = useState([]);

  // =========================
  // FETCH REQUESTS
  // =========================

  const fetchRequests = async () => {

    try {

        const response = await fetch(

        `${import.meta.env.VITE_API_URL}/add-cash-requests`,

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

        `${import.meta.env.VITE_API_URL}/approve-add-cash/${id}`,

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

        `http://127.0.0.1:8000/retry-add-cash/${id}`,

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


  const editRequest = async (request) => {

    const transaction_id = prompt(
      "Transaction ID",
      request.transaction_id || ""
    );

    if (transaction_id === null) return;

    const ocr_amount = prompt(
      "OCR Amount",
      request.ocr_amount || ""
    );

    if (ocr_amount === null) return;

    const payment_date = prompt(
      "Payment Date",
      request.payment_date || ""
    );

    if (payment_date === null) return;

    const payment_status = prompt(
      "Payment Status",
      request.payment_status || "verified"
    );

    if (payment_status === null) return;

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/edit-add-cash/${request._id}`,

        {

          method: "POST",

          headers: {

            "Content-Type":
            "application/json",

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          },

          body: JSON.stringify({

            transaction_id,
            ocr_amount,
            payment_date,
            payment_status

          })

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

      errorToast("Edit failed");

    }

  };


  return (

    <div className="space-y-6">

      <h1
        className="
        text-4xl
        font-black
        text-yellow-400
        "
      >

        ADD CASH REQUESTS

      </h1>

      {

        requests.map((request) => (

          <div

            key={request._id}

            className="
            bg-white/5
            border
            border-yellow-500/10
            rounded-3xl
            p-6
            "

          >

            <div
              className="
              grid
              md:grid-cols-2
              gap-6
              "
            >

              {/* IMAGE */}
              <div>

                <img

                  src={`${import.meta.env.VITE_API_URL}/${request.screenshot}`}

                  alt="payment"

                  className="
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-yellow-500/20
                    object-contain
                    bg-black
                    "

                />

              </div>

              {/* DETAILS */}
              <div
                className="
                flex
                flex-col
                justify-between
                "
              >

                <div className="space-y-3">

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
                    text-yellow-400
                    text-xl
                    font-bold
                    "
                  >

                    ₹{request.amount}

                  </p>

                  <p className="text-gray-400">

                    Status:
                    {" "}
                    {request.status}

                  </p>

                  {

                    request.reason && (

                      <p className="text-red-400">

                        Reason:
                        {" "}
                        {request.reason}

                      </p>

                    )

                  }

                  <p className="text-gray-300">
                    Transaction ID:
                    {" "}
                    {request.transaction_id}
                  </p>

                  <p className="text-gray-300">
                    OCR Amount:
                    {" "}
                    ₹{request.ocr_amount}
                  </p>

                  <p className="text-gray-300">
                    Payment Date:
                    {" "}
                    {request.payment_date}
                  </p>

                  <p
                    className={`font-bold ${
                      request.payment_status === "verified"
                        ? "text-green-400"
                        : request.payment_status === "manual_verify"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >

                    OCR:
                    {" "}
                    {request.payment_status}

                  </p>

                </div>

                {

                  request.status === "pending" && (

                    <div
                      className="
                      flex
                      gap-4
                      mt-6
                      "
                    >
                      
                      <button

                        onClick={() =>

                          editRequest(request)

                        }

                        className="
                        flex
                        items-center
                        gap-2
                        bg-blue-500
                        text-white
                        px-5
                        py-3
                        rounded-2xl
                        font-black
                        "

                      >

                        <Pencil size={20} />

                        Edit

                      </button>

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

          </div>

        ))

      }

    </div>

  );

};

export default AddCashRequests;