
import {

  useEffect,
  useState

} from "react";

import {

  Trash2,
  Pencil

} from "lucide-react";


import {

  errorToast

} from "../../Utils/showToast";

const deleteTransaction = async (id) => {

  const confirmDelete = window.confirm(

    "Delete this transaction?"

  );

  if (!confirmDelete) return;

  try {

    const response = await fetch(

      `${import.meta.env.VITE_API_URL}/delete-transaction/${id}`,

      {

        method: "DELETE",

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

    fetchTransactions();

  }

  catch {

    errorToast("Delete failed");

  }

};

const editTransaction = async (transaction) => {

  const status = prompt(

    "Enter status",

    transaction.status

  );

  if (!status) return;

  const amount = prompt(

    "Enter amount",

    transaction.amount

  );

  if (!amount) return;

  const message = prompt(

    "Enter message",

    transaction.message

  );

  try {

    const response = await fetch(

      `${import.meta.env.VITE_API_URL}/edit-transaction/${transaction._id}`,

      {

        method: "PUT",

        headers: {

          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${localStorage.getItem("token")}`

        },

        body: JSON.stringify({

          status,
          amount,
          message

        })

      }

    );

    const data = await response.json();

    if (data.error) {

      errorToast(data.error);

      return;

    }

    successToast(data.message);

    fetchTransactions();

  }

  catch {

    errorToast("Edit failed");

  }

};

const Transactions = () => {

  const [transactions, setTransactions] = useState([]);

  // =========================
  // FETCH
  // =========================

  const fetchTransactions = async () => {

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/transactions`,

        {

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          }

        }

      );

      const data = await response.json();

      setTransactions(

        Array.isArray(data)
        ? data
        : []

      );

    }

    catch {

      errorToast(
        "Failed to load transactions"
      );

    }

  };

  useEffect(() => {

    fetchTransactions();

  }, []);

 return (

  <div className="space-y-4 sm:space-y-6 overflow-x-hidden px-2 sm:px-0">

    {/* TOP */}
    <div
      className="
      flex
      flex-col sm:flex-row
      sm:items-center
      sm:justify-between
      gap-4
      "
    >

      <h1
        className="
        text-2xl sm:text-4xl
        font-black
        text-cyan-400
        break-words
        "
      >

        TRANSACTION HISTORY

      </h1>

      <div
        className="
        w-full sm:w-auto
        px-4 sm:px-6
        py-3
        rounded-2xl
        bg-cyan-500/10
        border
        border-cyan-500/20
        text-cyan-300
        text-base sm:text-xl
        font-black
        text-center
        "
      >

        Total:
        {" "}
        {transactions.length}

      </div>

    </div>

    {/* MOBILE CARDS */}
    <div className="block lg:hidden space-y-4">

      {

        transactions.map((transaction) => (

          <div

            key={transaction._id}

            className="
            rounded-3xl
            border
            border-cyan-500/20
            bg-white/5
            p-4
            backdrop-blur-xl
            "

          >

            {/* EMAIL */}
            <div className="mb-4">

              <h2 className="text-white font-black break-all text-lg">

                {transaction.email}

              </h2>

            </div>

            {/* GRID */}
            <div className="grid grid-cols-2 gap-3 text-sm">

              <div className="rounded-xl bg-black/30 p-3">

                <p className="text-gray-500 text-xs mb-1">

                  TYPE

                </p>

                <p className="text-yellow-400 font-bold">

                  {transaction.type}

                </p>

              </div>

              <div className="rounded-xl bg-black/30 p-3">

                <p className="text-gray-500 text-xs mb-1">

                  AMOUNT

                </p>

                <p className="text-green-400 font-bold">

                  ₹{transaction.amount}

                </p>

              </div>

              <div className="rounded-xl bg-black/30 p-3 col-span-2">

                <p className="text-gray-500 text-xs mb-1">

                  UPI ID

                </p>

                <p className="text-gray-300 break-all">

                  {transaction.upi_id || "-"}

                </p>

              </div>

              <div className="rounded-xl bg-black/30 p-3">

                <p className="text-gray-500 text-xs mb-1">

                  STATUS

                </p>

                <p
                  className={`font-black ${
                    transaction.status === "SUCCESS"
                      ? "text-green-400"
                      : transaction.status === "PENDING"
                      ? "text-yellow-400"
                      : transaction.status === "RETRY"
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >

                  {transaction.status}

                </p>

              </div>

              <div className="rounded-xl bg-black/30 p-3">

                <p className="text-gray-500 text-xs mb-1">

                  TRANSACTION ID

                </p>

                <p className="text-gray-300 break-all">

                  {transaction.transaction_id || "-"}

                </p>

              </div>

              <div className="rounded-xl bg-black/30 p-3 col-span-2">

                <p className="text-gray-500 text-xs mb-1">

                  MESSAGE

                </p>

                <p className="text-gray-300 break-words">

                  {transaction.message || "-"}

                </p>

              </div>

              <div className="rounded-xl bg-black/30 p-3 col-span-2">

                <p className="text-gray-500 text-xs mb-1">

                  DATE

                </p>

                <p className="text-gray-400 text-sm">

                  {

                    transaction.created_at
                    ? new Date(
                        transaction.created_at
                      ).toLocaleString()
                    : "-"

                  }

                </p>

              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-5">

              <button

                onClick={() =>
                  editTransaction(transaction)
                }

                className="
                flex-1
                flex
                items-center
                justify-center
                gap-2
                p-3
                rounded-2xl
                bg-yellow-500
                text-black
                font-black
                "

              >

                <Pencil size={18} />

                Edit

              </button>

              <button

                onClick={() =>
                  deleteTransaction(
                    transaction._id
                  )
                }

                className="
                flex-1
                flex
                items-center
                justify-center
                gap-2
                p-3
                rounded-2xl
                bg-red-500
                text-white
                font-black
                "

              >

                <Trash2 size={18} />

                Delete

              </button>

            </div>

          </div>

        ))

      }

    </div>

    {/* DESKTOP TABLE */}
    <div
      className="
      hidden lg:block
      overflow-x-auto
      rounded-3xl
      border
      border-cyan-500/20
      "
    >

      <table
        className="
        w-full
        text-left
        min-w-[1200px]
        "
      >

        <thead
          className="
          bg-cyan-500/10
          text-cyan-400
          "
        >

          <tr>

            <th className="p-4">Email</th>

            <th className="p-4">Type</th>

            <th className="p-4">Amount</th>

            <th className="p-4">UPI ID</th>

            <th className="p-4">Status</th>

            <th className="p-4">Transaction ID</th>

            <th className="p-4">Message</th>

            <th className="p-4">Date</th>

            <th className="p-4">Actions</th>

          </tr>

        </thead>

        <tbody>

          {

            transactions.map((transaction) => (

              <tr

                key={transaction._id}

                className="
                border-t
                border-cyan-500/10
                hover:bg-white/5
                "

              >

                <td className="p-4 text-white break-all">

                  {transaction.email}

                </td>

                <td className="p-4 text-yellow-400 font-bold">

                  {transaction.type}

                </td>

                <td className="p-4 text-green-400 font-bold">

                  ₹{transaction.amount}

                </td>

                <td className="p-4 text-gray-300 break-all">

                  {transaction.upi_id || "-"}

                </td>

                <td
                  className={`p-4 font-black ${
                    transaction.status === "SUCCESS"
                      ? "text-green-400"
                      : transaction.status === "PENDING"
                      ? "text-yellow-400"
                      : transaction.status === "RETRY"
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >

                  {transaction.status}

                </td>

                <td className="p-4 text-gray-300 break-all">

                  {

                    transaction.transaction_id
                    || "-"

                  }

                </td>

                <td className="p-4 text-gray-300 break-words">

                  {transaction.message}

                </td>

                <td className="p-4 text-gray-500">

                  {

                    transaction.created_at
                    ? new Date(
                        transaction.created_at
                      ).toLocaleString()
                    : "-"

                  }

                </td>

                <td className="p-4">

                  <div className="flex gap-3">

                    {/* EDIT */}
                    <button

                      onClick={() =>
                        editTransaction(transaction)
                      }

                      className="
                      p-2
                      rounded-xl
                      bg-yellow-500
                      text-black
                      hover:scale-105
                      transition-all
                      "

                    >

                      <Pencil size={18} />

                    </button>

                    {/* DELETE */}
                    <button

                      onClick={() =>
                        deleteTransaction(
                          transaction._id
                        )
                      }

                      className="
                      p-2
                      rounded-xl
                      bg-red-500
                      text-white
                      hover:scale-105
                      transition-all
                      "

                    >

                      <Trash2 size={18} />

                    </button>

                  </div>

                </td>

              </tr>

            ))

          }

        </tbody>

      </table>

    </div>

  </div>

);

};

export default Transactions;
