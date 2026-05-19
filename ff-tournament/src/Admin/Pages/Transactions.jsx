
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

} from "../../utils/showToast";

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

    <div className="space-y-6">

      
<div
  className="
  flex
  items-center
  justify-between
  flex-wrap
  gap-4
  "
>

  <h1
    className="
    text-4xl
    font-black
    text-cyan-400
    "
  >

    TRANSACTION HISTORY

  </h1>

  <div
    className="
    px-6
    py-3
    rounded-2xl
    bg-cyan-500/10
    border
    border-cyan-500/20
    text-cyan-300
    text-xl
    font-black
    "
  >

    Total:
    {" "}
    {transactions.length}

  </div>

</div>



      <div
        className="
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
          "
        >

          <thead
            className="
            bg-cyan-500/10
            text-cyan-400
            "
          >

            <tr>

              <th className="p-4">

                Email

              </th>

              <th className="p-4">

                Type

              </th>

              <th className="p-4">

                Amount

              </th>
                          
              <th className="p-4">
                UPI ID
              </th>

              <th className="p-4">

                Status

              </th>

              <th className="p-4">

                Transaction ID

              </th>

              <th className="p-4">

                Message

              </th>

              <th className="p-4">

                Date

              </th>

                <th className="p-4">

                Actions

                </th>

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

                  <td className="p-4 text-white">

                    {transaction.email}

                  </td>

                  <td className="p-4 text-yellow-400 font-bold">

                    {transaction.type}

                  </td>
                      
                  <td className="p-4 text-gray-300"> { transaction.upi_id || "-" } </td>

                  <td className="p-4 text-green-400 font-bold">

                    ₹{transaction.amount}

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

                  <td className="p-4 text-gray-300">

                    {

                      transaction.transaction_id
                      || "-"

                    }

                  </td>

                  <td className="p-4 text-gray-300">

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
