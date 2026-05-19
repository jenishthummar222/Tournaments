import {

  Trophy,
  Users,
  Wallet,
  BadgeIndianRupee,
  Gamepad2,
  Clock3

} from "lucide-react";

import {

  useEffect,
  useState

} from "react";

import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  
  const [liveMatches, setLiveMatches] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({

    total_users: 0,

    total_tournaments: 0,

    pending_add_cash: 0,

    pending_withdraw: 0,

    admin_wallet: 0,

    total_profit: 0,

    total_prize_paid: 0

  });

  const formatMatchTime = (time) => {
    if (!time) return "Not Scheduled";

    return new Date(time).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true
    });
  };

  const fetchUpcomingMatches = async () => {

    try {

      const response = await fetch(

        "http://127.0.0.1:8000/upcoming-live-matches",

        {

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          }

        }

      );

      const data = await response.json();

      console.log("LIVE MATCHES:", data);

      setLiveMatches(

        Array.isArray(data)
        ? data
        : []

      );

    }

    catch (error) {

      console.log(error);

    }

  };

  const fetchDashboardStats = async () => {

    try {

      const response = await fetch(

        "http://127.0.0.1:8000/admin-dashboard-stats",

        {

          headers: {

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          }

        }

      );

      const data = await response.json();

      setDashboardStats(data);

    }

    catch (error) {

      console.log(error);

    }

  };

  useEffect(() => { fetchDashboardStats(); }, []);
  useEffect(() => {

    fetchUpcomingMatches();

    const interval = setInterval(() => {

      fetchUpcomingMatches();

    }, 30000);

    return () => clearInterval(interval);

  }, []);

  const navigate = useNavigate();

  const stats = [

    {

      title: "Total Users",

      value: dashboardStats.total_users,

      icon: Users

    },

    {

      title: "Total Tournaments",

      value: dashboardStats.total_tournaments,

      icon: Trophy

    },

    {

      title: "Pending Add Cash",

      value: dashboardStats.pending_add_cash,

      icon: Wallet

    },

    {

      title: "Pending Withdraw",

      value: dashboardStats.pending_withdraw,

      icon: BadgeIndianRupee

    },
    {
      title: "Admin Wallet",
      value: `₹${dashboardStats.admin_wallet}`,
      icon: Wallet
    },

    {
      title: "Total Profit",
      value: `₹${dashboardStats.total_profit}`,
      icon: Trophy
    },

    {
      title: "Prize Distributed",
      value: `₹${dashboardStats.total_prize_paid}`,
      icon: BadgeIndianRupee
    },

  ];

  return (

    <div>

      {/* TOP */}
      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-5xl font-black text-yellow-400">

            ADMIN DASHBOARD

          </h1>

          <p className="text-gray-500 mt-2">

            Manage tournaments, payments and users

          </p>

        </div>

        <div className="rounded-2xl bg-green-500/10 border border-green-500/20 px-5 py-3 flex items-center gap-3">

          <Clock3 className="text-green-400" />

          <span className="text-green-400 font-bold">

            SYSTEM ONLINE

          </span>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map((stat, index) => {

          const Icon = stat.icon;

          return (

            <div
              key={index}
              className="
              rounded-[30px]
              bg-white/5
              border
              border-yellow-500/10
              p-6
              backdrop-blur-xl
              hover:scale-105
              transition-all
              duration-300
              "
            >

              <div className="flex items-center justify-between mb-5">

                <Icon className="text-yellow-400 w-10 h-10" />

                <Gamepad2 className="text-red-400 w-6 h-6 animate-pulse" />

              </div>

              <h3 className="text-gray-400 text-lg mb-2">

                {stat.title}

              </h3>

              <h1 className="text-5xl font-black text-yellow-400">

                {stat.value}

              </h1>

            </div>

          );

        })}

      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-14">

        <h2 className="text-3xl font-black text-yellow-400 mb-6">

          QUICK ACTIONS

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <button

            onClick={() => navigate("/admin/create-tournament")}

            className="
            rounded-3xl
            p-6
            bg-gradient-to-br
            from-yellow-400
            to-orange-500
            text-black
            font-black
            text-xl
            hover:scale-105
            transition-all
            duration-300
            shadow-[0_0_30px_rgba(255,215,0,0.35)]
            "

          >

            ➕ Create Tournament

          </button>

          <button
            onClick={() => navigate("/admin/add-cash")}
            className="
            rounded-3xl
            p-6
            bg-white/5
            border
            border-yellow-500/10
            hover:border-yellow-400/30
            transition-all
            duration-300
            text-xl
            font-black
            "

          >

            💰 Add Cash Requests

          </button>

          <button

            onClick={() => navigate("/admin/withdraw")}
            className="
            rounded-3xl
            p-6
            bg-white/5
            border
            border-yellow-500/10
            hover:border-yellow-400/30
            transition-all
            duration-300
            text-xl
            font-black
            "

          >

            🏆 Withdraw Request

          </button>

          <button

            onClick={() => navigate("/admin/users")}
            className="
            rounded-3xl
            p-6
            bg-white/5
            border
            border-yellow-500/10
            hover:border-yellow-400/30
            transition-all
            duration-300
            text-xl
            font-black
            "

          >

            👥 Manage Users

          </button>

        </div>

      </div>

     
      {/* UPCOMING LIVE MATCHES */}
      <div className="mt-14">

        <h2
          className="
          text-3xl
          font-black
          text-yellow-400
          mb-6
          "
        >

          UPCOMING LIVE MATCHES

        </h2>

        <div className="space-y-4">

          {

            liveMatches.length === 0 && (

              <div
                className="
                rounded-2xl
                bg-white/5
                border
                border-yellow-500/10
                p-6
                text-gray-400
                "
              >

                No upcoming matches

              </div>

            )

          }

          {

            liveMatches.map((match) => (

              <div

                key={match._id}

                onClick={() =>

                  navigate(

                    `/admin/manage?tournament=${match._id}`

                  )

                }

                className="
                rounded-2xl
                bg-white/5
                border
                border-yellow-500/10
                p-5
                flex
                items-center
                justify-between
                cursor-pointer
                hover:bg-yellow-500/10
                transition-all
                "

              >

                <div>

                  <h3
                    className="
                    font-black
                    text-xl
                    text-white
                    "
                  >

                    {match.title}

                  </h3>

                  <p className="text-gray-400">

                    {match.game_mode}
                    {" • "}
                    {match.map}

                  </p>

                  <p className="text-yellow-400 font-bold">

                    ₹{match.entry_fee}

                  </p>

                  <p className="text-gray-500">

                    {formatMatchTime(match.match_time)}

                  </p>

                </div>

                <div className="text-right">

                  {

                    match.room_id

                    ? (

                      <div>

                        <p className="text-green-400 font-bold">

                          ROOM READY

                        </p>

                        <p className="text-gray-400">

                          ID:
                          {" "}
                          {match.room_id}

                        </p>

                      </div>

                    )

                    : (

                      <p className="text-red-400 font-bold">

                        ROOM NOT ADDED

                      </p>

                    )

                  }

                </div>

              </div>

            ))

          }

        </div>

      </div>



    </div>

  );

};

export default AdminDashboard;