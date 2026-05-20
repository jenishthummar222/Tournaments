
import {

  useEffect,
  useState

} from "react";

import {

  Trash2,
  Ban,
  CheckCircle,
  Pencil

} from "lucide-react";

import {

  successToast,
  errorToast

} from "../../Utils/showToast";

const AdminUsers = () => {

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  // =========================
  // FETCH USERS
  // =========================

  const fetchUsers = async () => {

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/all-users`,

        {

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          }

        }

      );

      const data = await response.json();

      setUsers(

        Array.isArray(data)
        ? data
        : []

      );

    }

    catch {

      errorToast(
        "Failed to load users"
      );

    }

  };

  useEffect(() => {

    fetchUsers();

  }, []);

  // =========================
  // BAN USER
  // =========================

  const banUser = async (id) => {

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/ban-user/${id}`,

        {

          method: "POST",

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          }

        }

      );

      const data = await response.json();

      successToast(data.message);

      fetchUsers();

    }

    catch {

      errorToast("Ban failed");

    }

  };

  // =========================
  // UNBAN USER
  // =========================

  const unbanUser = async (id) => {

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/unban-user/${id}`,

        {

          method: "POST",

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          }

        }

      );

      const data = await response.json();

      successToast(data.message);

      fetchUsers();

    }

    catch {

      errorToast("Unban failed");

    }

  };

  // =========================
  // DELETE USER
  // =========================

  const deleteUser = async (id) => {

    const confirmDelete = window.confirm(

      "Delete this user?"

    );

    if (!confirmDelete) return;

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/delete-user/${id}`,

        {

          method: "DELETE",

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          }

        }

      );

      const data = await response.json();

      successToast(data.message);

      fetchUsers();

    }

    catch {

      errorToast("Delete failed");

    }

  };

  // =========================
  // EDIT WALLET
  // =========================

  const editWallet = async (user) => {

    const wallet = prompt(

      "Enter wallet amount",

      user.wallet

    );

    if (!wallet) return;

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/update-wallet/${user._id}`,

        {

          method: "PUT",

          headers: {

            "Content-Type":
            "application/json",

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          },

          body: JSON.stringify({

            wallet

          })

        }

      );

      const data = await response.json();

      successToast(data.message);

      fetchUsers();

    }

    catch {

      errorToast("Wallet update failed");

    }

  };

  // =========================
  // FILTER USERS
  // =========================

  const filteredUsers = users.filter((user) =>

    user.name
    ?.toLowerCase()
    .includes(search.toLowerCase())

    ||

    user.email
    ?.toLowerCase()
    .includes(search.toLowerCase())

  );

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div
        className="
        flex
        justify-between
        items-center
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

          USERS MANAGEMENT

        </h1>

        <div
          className="
          px-5
          py-3
          rounded-2xl
          bg-cyan-500/10
          border
          border-cyan-500/20
          text-cyan-300
          font-black
          "
        >

          Total:
          {" "}
          {filteredUsers.length}

        </div>

      </div>

      {/* SEARCH */}
      <input

        type="text"

        placeholder="Search user..."

        value={search}

        onChange={(e) =>
          setSearch(e.target.value)
        }

        className="
        w-full
        rounded-2xl
        bg-white/5
        border
        border-cyan-500/20
        p-4
        text-white
        outline-none
        "

      />

      {/* USERS */}
      <div className="grid gap-6">

        {

          filteredUsers.map((user) => (

            <div

              key={user._id}

              className="
              bg-white/5
              border
              border-cyan-500/10
              rounded-3xl
              p-6
              "

            >

              <div
                className="
                flex
                flex-col
                lg:flex-row
                justify-between
                gap-6
                "
              >

                {/* LEFT */}
                <div
                  className="
                  flex
                  gap-5
                  "
                >

                  <img

                    src={`${user.profile_pic}`}

                    alt="profile"

                    className="
                    w-24
                    h-24
                    rounded-2xl
                    object-cover
                    border
                    border-cyan-500/20
                    "

                  />

                  <div className="space-y-2">

                    <h2
                      className="
                      text-2xl
                      font-black
                      text-white
                      "
                    >

                      {user.name}

                    </h2>

                    <p className="text-gray-300">

                      {user.email}

                    </p>

                    <p className="text-gray-400">

                      {user.mobile}

                    </p>

                    <p className="text-yellow-400 font-bold">

                      Wallet:
                      {" "}
                      ₹{user.wallet}

                    </p>

                    <p className="text-gray-400">

                      Matches:
                      {" "}
                      {user.matches}

                    </p>

                    <p className="text-green-400">

                      Wins:
                      {" "}
                      {user.wins}

                    </p>

                    <p
                      className={`font-bold ${
                        user.status === "banned"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >

                      {user.status}

                    </p>

                  </div>

                </div>

                {/* RIGHT */}
                <div
                  className="
                  flex
                  gap-3
                  flex-wrap
                  "
                >

                  {/* EDIT WALLET */}
                  <button

                    onClick={() =>
                      editWallet(user)
                    }

                    className="
                    h-fit
                    flex
                    items-center
                    gap-2
                    px-5
                    py-3
                    rounded-2xl
                    bg-yellow-500
                    text-black
                    font-black
                    "

                  >

                    <Pencil size={18} />

                    Wallet

                  </button>

                  {/* BAN/UNBAN */}
                  {

                    user.status === "banned"

                    ? (

                      <button

                        onClick={() =>
                          unbanUser(user._id)
                        }

                        className="
                        h-fit
                        flex
                        items-center
                        gap-2
                        px-5
                        py-3
                        rounded-2xl
                        bg-green-500
                        text-black
                        font-black
                        "

                      >

                        <CheckCircle size={18} />

                        Unban

                      </button>

                    )

                    : (

                      <button

                        onClick={() =>
                          banUser(user._id)
                        }

                        className="
                        h-fit
                        flex
                        items-center
                        gap-2
                        px-5
                        py-3
                        rounded-2xl
                        bg-red-500
                        text-white
                        font-black
                        "

                      >

                        <Ban size={18} />

                        Ban

                      </button>

                    )

                  }

                  {/* DELETE */}
                  <button

                    onClick={() =>
                      deleteUser(user._id)
                    }

                    className="
                    h-fit
                    flex
                    items-center
                    gap-2
                    px-5
                    py-3
                    rounded-2xl
                    bg-red-700
                    text-white
                    font-black
                    "

                  >

                    <Trash2 size={18} />

                    Delete

                  </button>

                </div>

              </div>

            </div>

          ))

        }

      </div>

    </div>

  );

};

export default AdminUsers;
