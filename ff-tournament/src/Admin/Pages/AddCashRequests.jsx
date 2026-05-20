import { useEffect, useState } from "react";
import { CheckCircle, RotateCcw, Pencil } from "lucide-react";
import { successToast, errorToast } from "../../Utils/showToast";

const AddCashRequests = () => {

  const [requests, setRequests] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // =========================
  // FETCH
  // =========================
  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/add-cash-requests`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
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
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/approve-add-cash/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();

      if (data.error) return errorToast(data.error);

      successToast(data.message);
      fetchRequests();

    } catch {
      errorToast("Approval failed");
    }
  };

  // =========================
  // RETRY
  // =========================
  const retryRequest = async (id) => {
    const reason = prompt("Enter retry reason");
    if (!reason) return;

    try {
      const formData = new FormData();
      formData.append("reason", reason);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/retry-add-cash/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: formData
        }
      );

      const data = await res.json();

      if (data.error) return errorToast(data.error);

      successToast(data.message);
      fetchRequests();

    } catch {
      errorToast("Retry failed");
    }
  };

  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-black text-yellow-400">
        ADD CASH REQUESTS
      </h1>

      {requests.map((request) => (
        <div
          key={request._id}
          className="bg-white/5 border border-yellow-500/10 rounded-3xl p-6"
        >

          <div className="grid md:grid-cols-2 gap-6">

            {/* IMAGE */}
            <img
              src={request.screenshot}
              className="w-full max-w-md rounded-2xl border border-yellow-500/20 object-contain bg-black"
              alt="payment"
            />

            {/* DETAILS */}
            <div className="flex flex-col justify-between">

              <div className="space-y-3">

                <h2 className="text-2xl font-black text-white">
                  {request.email}
                </h2>

                <p className="text-yellow-400 text-xl font-bold">
                  ₹{request.amount}
                </p>

                <p className="text-gray-400">
                  Status: {request.status}
                </p>

                {request.transaction_id && (
                  <p className="text-gray-300">
                    Transaction ID: {request.transaction_id}
                  </p>
                )}

                {request.payment_status && (
                  <p className="text-gray-300">
                    Payment Status: {request.payment_status}
                  </p>
                )}

                {request.reason && (
                  <p className="text-red-400">
                    Reason: {request.reason}
                  </p>
                )}

              </div>

              {/* ACTIONS */}
              {request.status === "pending" && (
                <div className="flex gap-4 mt-6">

                  <button
                    onClick={() => {
                      setEditData(request);
                      setEditOpen(true);
                    }}
                    className="bg-blue-500 text-white px-5 py-3 rounded-2xl font-black flex items-center gap-2"
                  >
                    <Pencil size={20} /> Edit
                  </button>

                  <button
                    onClick={() => approveRequest(request._id)}
                    className="bg-green-500 text-black px-5 py-3 rounded-2xl font-black flex items-center gap-2"
                  >
                    <CheckCircle size={20} /> Approve
                  </button>

                  <button
                    onClick={() => retryRequest(request._id)}
                    className="bg-red-500 text-white px-5 py-3 rounded-2xl font-black flex items-center gap-2"
                  >
                    <RotateCcw size={20} /> Retry
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>
      ))}

      {/* =========================
          EDIT MODAL (FIXED)
          ========================= */}
        {editOpen && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">

            {/* BLUR BACKGROUND */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => {
                setEditOpen(false);
                setEditData(null);
              }}
            />

            {/* MODAL BOX */}
            <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

              {/* HEADER */}
              <div className="p-5 bg-yellow-400">
                <h2 className="text-xl font-black text-black">
                  Edit Add Cash Request
                </h2>
                <p className="text-sm text-black/70">
                  Update transaction details
                </p>
              </div>

              {/* BODY */}
              <div className="p-5 space-y-4 flex-1 overflow-y-auto scrollbar-hide">

                {/* SCREENSHOT (IMPORTANT FIX) */}
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-2">
                    Payment Screenshot
                  </p>

                  <img
                    src={editData.screenshot}
                    alt="payment"
                    className="w-full rounded-xl border object-contain bg-black"
                  />
                </div>

                <div className="space-y-4">

                  {/* Transaction ID */}
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <label className="text-xs font-bold text-gray-500">
                      TRANSACTION ID
                    </label>
                    <input
                      className="w-full mt-1 bg-transparent outline-none text-gray-900 font-medium"
                      placeholder="Enter transaction ID"
                      value={editData.transaction_id || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, transaction_id: e.target.value })
                      }
                    />
                  </div>

                  {/* Amount */}
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <label className="text-xs font-bold text-gray-500">
                      AMOUNT
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1 bg-transparent outline-none text-gray-900 font-medium"
                      placeholder="Enter amount"
                      value={editData.amount || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, amount: e.target.value })
                      }
                    />
                  </div>

                  {/* Payment Date */}
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <label className="text-xs font-bold text-gray-500">
                      PAYMENT DATE
                    </label>
                    <input
                      type="date"
                      className="w-full mt-1 bg-transparent outline-none text-gray-900 font-medium"
                      value={editData.payment_date || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, payment_date: e.target.value })
                      }
                    />
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <label className="text-xs font-bold text-gray-500">
                      PAYMENT STATUS
                    </label>
                    <select
                      className="w-full mt-1 bg-transparent outline-none text-gray-900 font-medium"
                      value={editData.payment_status || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, payment_status: e.target.value })
                      }
                    >
                      <option value="verified">Verified</option>
                      <option value="manual_verify">Manual Verify</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="flex gap-3 p-5 border-t bg-gray-50">

                <button
                  className="w-1/2 bg-gray-200 hover:bg-gray-300 font-bold py-3 rounded-lg"
                  onClick={() => {
                    setEditOpen(false);
                    setEditData(null);
                  }}
                >
                  Close
                </button>

                <button
                  className="w-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
                  onClick={async () => {
                    const formData = new FormData();
                    formData.append("transaction_id", editData.transaction_id || "");
                    formData.append("amount", editData.amount || "");
                    formData.append("payment_date", editData.payment_date || "");
                    formData.append("payment_status", editData.payment_status || "");

                    const res = await fetch(
                      `${import.meta.env.VITE_API_URL}/edit-add-cash/${editData._id}`,
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: formData
                      }
                    );

                    const data = await res.json();

                    if (data.error) errorToast(data.error);
                    else successToast(data.message);

                    setEditOpen(false);
                    setEditData(null);
                    fetchRequests();
                  }}
                >
                  Save
                </button>

              </div>

            </div>
          </div>
        )}

    </div>
  );
};

export default AddCashRequests;