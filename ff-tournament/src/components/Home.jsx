
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import airplane from "../assets/airplane.png"

import {
  Flame,
  Trophy,
  Bomb,
  Shield,
  Wallet,
  Gamepad2,
  Swords,
} from "lucide-react";

import {
  successToast,
  errorToast,
} from "../Utils/showToast";

const Home = () => {

  const [search, setSearch] = useState("");

  const [tournaments, setTournaments] = useState([]);

  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());

  useEffect(() => {


    fetch(`${import.meta.env.VITE_API_URL}/tournaments`)

      .then((res) => res.json())

      .then((data) => {

        setTournaments(data);

        localStorage.setItem(
          "tournaments",
          JSON.stringify(data)
        );

      })

      .catch((error) => {

        console.log(error);
      }); 
  

  }, []);
  useEffect(() => {

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);

  }, []);

  const getStatus = (startTime) => {

    const start = new Date(startTime);
    const diff = (start - now) / 1000 / 60;

    if (diff <= -120) return "COMPLETED";
    if (diff <= 0) return "LIVE";
    return "UPCOMING";

  };

  const getCountdown = (startTime) => {

    if (!startTime) return "Not Scheduled";

    const start = new Date(startTime);

    if (isNaN(start.getTime())) {
      return "Invalid Time";
    }

    const diff = start - now;

    if (diff <= 0) return "Started";

    const totalSeconds = Math.floor(diff / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;

  };
  const filteredTournaments = tournaments.filter((tournament) => {

    return (

      tournament.title
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      tournament.game_mode
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );

  });

  return (

    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(255,180,0,0.18), transparent 35%), radial-gradient(circle at bottom, rgba(255,0,0,0.15), transparent 35%)"
        }}
      />

      {/* Fire Glow */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-0 left-[10%] w-72 h-72 bg-orange-500/20 blur-[120px] rounded-full animate-pulse" />

        <div className="absolute bottom-0 right-[15%] w-96 h-96 bg-red-500/20 blur-[150px] rounded-full animate-pulse" />

        <div className="absolute top-[30%] left-[45%] w-80 h-80 bg-yellow-400/10 blur-[140px] rounded-full animate-ping" />

      </div>

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Smoke */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black" />

      {/* Dynamic Airplane */}
      <div className="absolute top-20 -left-72 z-0 opacity-30 animate-[planeFly_15s_linear_infinite]">

       <img
        src={airplane}
        alt="airdrop-plane"
        className="w-80 rotate-3 opacity-90"
      />

      </div>


      {/* Dynamic Falling Players */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-[-10%] left-[15%] animate-[playerDrop1_8s_linear_infinite] text-3xl">
          🪂
        </div>

        <div className="absolute top-[-15%] left-[45%] animate-[playerDrop2_10s_linear_infinite] text-4xl">
          🪂
        </div>

        <div className="absolute top-[-20%] left-[75%] animate-[playerDrop3_7s_linear_infinite] text-2xl">
          🪂
        </div>

        <div className="absolute top-[-12%] left-[60%] animate-[playerDrop4_9s_linear_infinite] text-3xl">
          🪂
        </div>

      </div>
      {/* Loot Drop Light */}
      <div className="absolute bottom-20 left-[10%] w-40 h-40 bg-blue-500/20 blur-[90px] rounded-full animate-pulse" />

      <div className="absolute bottom-32 right-[15%] w-52 h-52 bg-purple-500/20 blur-[100px] rounded-full animate-pulse" />

      <div className="absolute top-[40%] left-[50%] w-36 h-36 bg-yellow-400/20 blur-[90px] rounded-full animate-ping" />

      {/* Animated Loot Crates */}
      <div className="absolute bottom-24 left-[20%] text-5xl animate-bounce">
        📦
      </div>

      <div className="absolute bottom-40 right-[22%] text-6xl animate-pulse">
        🎁
      </div>

      <div className="absolute top-[60%] left-[55%] text-4xl animate-bounce">
        💎
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-[10%] left-[20%] w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />

        <div className="absolute top-[40%] left-[70%] w-3 h-3 bg-orange-500 rounded-full animate-ping" />

        <div className="absolute bottom-[20%] left-[40%] w-2 h-2 bg-red-500 rounded-full animate-bounce" />

        <div className="absolute top-[70%] right-[25%] w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />

      </div>

      {/* Floating Icons */}
      <Flame className="absolute top-16 left-10 text-orange-500 w-14 h-14 animate-bounce" />

      <Bomb className="absolute bottom-20 left-20 text-red-500 w-12 h-12 animate-pulse" />

      <Shield className="absolute top-24 right-14 text-yellow-400 w-12 h-12 animate-spin" />

      <Swords className="absolute bottom-24 right-20 text-white w-14 h-14 animate-bounce" />

      {/* Main Content */}
      <div className="relative z-10">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-5 border-b border-yellow-500/10 backdrop-blur-md bg-black/30 sticky top-0 z-50">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.5)]">

              <Gamepad2 className="text-black w-6 h-6" />

            </div>

            <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-300 to-orange-500 bg-clip-text text-transparent tracking-wide">
              FF ARENA
            </h1>

          </div>

          <div className="flex gap-4">

            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black hover:scale-105 transition-all duration-300 shadow-[0_0_25px_rgba(255,215,0,0.35)]"
            >
              LOGIN
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 rounded-2xl border border-yellow-500/30 backdrop-blur-xl bg-white/5 hover:bg-yellow-500 hover:text-black transition-all duration-300 font-bold"
            >
              REGISTER
            </button>

          </div>

        </nav>

        {/* Hero Section */}
        <section className="px-6 py-24 text-center max-w-7xl mx-auto">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-8">

            <Trophy className="w-5 h-5 text-yellow-400" />

            <span className="text-yellow-300 font-semibold tracking-wide">
              INDIA'S MOST POWERFUL FF PLATFORM
            </span>

          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-tight mb-8 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
            DOMINATE
            <br />
            THE BATTLEFIELD
          </h1>

          <p className="text-gray-300 max-w-3xl mx-auto text-xl leading-relaxed mb-10">
            Join intense Free Fire tournaments, compete against pro players,
            earn real cash rewards, and climb the leaderboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">

            <button className="group relative overflow-hidden px-10 py-5 rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-xl hover:scale-105 transition-all duration-300 shadow-[0_0_45px_rgba(255,215,0,0.45)]">

              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-700" />

              <span className="relative z-10">
                JOIN TOURNAMENT
              </span>

            </button>

            <button className="px-10 py-5 rounded-3xl border border-yellow-500/30 bg-white/5 backdrop-blur-xl font-bold text-lg hover:bg-yellow-500 hover:text-black transition-all duration-300">
              WATCH LIVE MATCHES
            </button>

          </div>

        </section>

        {/* Wallet Banner */}
        <section className="px-6 mb-20">

          <div className="max-w-7xl mx-auto rounded-[40px] border border-yellow-500/20 backdrop-blur-xl bg-white/5 p-10 shadow-[0_0_60px_rgba(255,215,0,0.12)] flex flex-col lg:flex-row items-center justify-between gap-8">

            <div>

              <div className="flex items-center gap-4 mb-5">

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">

                  <Wallet className="text-black w-8 h-8" />

                </div>

                <h2 className="text-4xl font-black text-yellow-400">
                  Fast UPI Wallet
                </h2>

              </div>

              <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
                Deposit instantly using UPI QR and withdraw your winnings directly to your bank account within minutes.
              </p>

            </div>

            <div className="flex gap-5 flex-wrap">

              <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black hover:scale-105 transition-all duration-300">
                DEPOSIT
              </button>

              <button className="px-8 py-4 rounded-2xl border border-yellow-500/30 bg-white/5 font-bold hover:bg-yellow-500 hover:text-black transition-all duration-300">
                WITHDRAW
              </button>

            </div>

          </div>

        </section>
        <section className="px-6 mb-16">

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="rounded-3xl bg-white/5 border border-yellow-500/10 p-6">

              <h2 className="text-gray-400 mb-2">

                Total Tournaments

              </h2>

              <h1 className="text-5xl font-black text-yellow-400">

                {tournaments.length}

              </h1>

            </div>

            <div className="rounded-3xl bg-white/5 border border-green-500/10 p-6">

              <h2 className="text-gray-400 mb-2">

                Live Matches

              </h2>

              <h1 className="text-5xl font-black text-green-400">

                {
                  tournaments.filter(
                    (t) => getStatus(t.match_time) === "LIVE"
                  ).length
                }

              </h1>

            </div>

            <div className="rounded-3xl bg-white/5 border border-red-500/10 p-6">

              <h2 className="text-gray-400 mb-2">

                Total Prize Pools

              </h2>

              <h1 className="text-5xl font-black text-red-400">

                {
                  tournaments.reduce(
                    (acc, t) => acc + Number(t.prize || 0),
                    0
                  )
                }

              </h1>

            </div>

          </div>

        </section>
        {/* Tournament Section */}
        <section className="px-6 pb-24">

          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col lg:flex-row items-center justify-between gap-5 mb-12">

              <div>

                <h2 className="text-5xl font-black text-yellow-400 mb-3">
                  LIVE TOURNAMENTS
                </h2>

                <p className="text-gray-400 text-lg">
                  Join battles and win real cash rewards.
                </p>

              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Tournament..."
                className="
                w-full lg:w-[350px]
                bg-black/40
                border border-gray-700
                rounded-2xl
                px-5 py-4
                outline-none
                focus:border-yellow-400
                transition-all duration-300
                "
              />
              

            </div>
            <div className="flex gap-3 flex-wrap">

              <button
                onClick={() => setSearch("")}
                className="
                px-5 py-2
                rounded-xl
                bg-yellow-500/20
                text-yellow-400
                font-bold
                "
              >
                ALL
              </button>

              <button
                onClick={() => setSearch("Solo")}
                className="
                px-5 py-2
                rounded-xl
                bg-white/5
                hover:bg-yellow-500/20
                "
              >
                SOLO
              </button>

              <button
                onClick={() => setSearch("Clash")}
                className="
                px-5 py-2
                rounded-xl
                bg-white/5
                hover:bg-yellow-500/20
                "
              >
                CLASH SQUAD
              </button>

              <button
                onClick={() => setSearch("Lone")}
                className="
                px-5 py-2
                rounded-xl
                bg-white/5
                hover:bg-yellow-500/20
                "
              >
                LONE WOLF
              </button>

            </div>

            {/* Cards */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

              {filteredTournaments.map((tournament, index) => {

                const status = getStatus(tournament.match_time);
                
                return (

                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-[35px] border border-yellow-500/10 backdrop-blur-xl bg-white/5 p-8 hover:scale-[1.03] transition-all duration-500 shadow-[0_0_40px_rgba(255,215,0,0.08)] hover:shadow-[0_0_70px_rgba(255,215,0,0.25)]"
                  >

                    {/* Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-yellow-500/10 via-transparent to-red-500/10" />

                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between mb-7">

                      <h3 className="text-3xl font-black text-yellow-400">
                        {tournament.title}
                      </h3>
                      
                      
                      <span className=" ">                      
                        {/* COUNTDOWN */}
                        {status === "UPCOMING" && (
                          <p className="bg-yellow-500/20 text-yellow-400 px-4 py-1 rounded-full text-sm font-bold">
                            {getCountdown(tournament.match_time)}
                          </p>
                        )}

                        {/* LIVE indicator */}
                        {status === "LIVE" && (
                          <p className="text-green-400 animate-pulse px-4 py-1 rounded-full text-sm font-bold">
                            🔴 LIVE NOW
                          </p>
                        )}

                        {/* COMPLETED */}
                        {status === "COMPLETED" && (
                          <p className="text-red-400 px-4 py-1 rounded-full text-sm font-bold">
                            Match Ended
                          </p>
                        )}
                        

                      </span>

                    </div>

                    {/* Tournament Info */}
                    <div className="relative z-10 space-y-4 text-gray-300 mb-8 text-lg">

                      <p>
                        🎟 Entry Fee:
                        <span className="ml-2 text-white font-bold">
                          ₹{tournament.entry_fee}
                        </span>
                      </p>

                      <p>
                        🏆 Prize Pool:
                        <span className="ml-2 text-yellow-400 font-black">
                          ₹{tournament.prize}
                        </span>
                      </p>

                      <p>
                        👥 Players:
                        <span className="ml-2 text-white">
                          {Number(tournament?.joined_players) || 0}/
                            {Number(tournament?.players) || 0}
                        </span>
                      </p>

                      <p>
                        ⏰ Starts In:
                        <span className="ml-2 text-red-400 font-semibold">
                          {tournament.match_time
                            ? new Date(
                              tournament.match_time
                            ).toLocaleString()
                            : "Not Scheduled"}
                        </span>
                      </p>

                    </div>

                    {/* Button */}
                    <button
                      disabled={status !== "UPCOMING"}
                      onClick={async () => {

                        const token =
                          localStorage.getItem("token");

                        if (!token) {

                          errorToast("Please Login First 🔒");

                          setTimeout(() => {

                            navigate("/login");

                          }, 1000);

                          return;
                        }

                        const user = JSON.parse(
                          localStorage.getItem("user")
                        );

                        const response = await fetch(
                          `${import.meta.env.VITE_API_URL}/join-tournament`,
                          {
                            method: "POST",

                            headers: {
                              "Content-Type": "application/json",
                            },

                            body: JSON.stringify({
                              email: user.email,
                              title: tournament.title,
                            }),
                          }
                        );

                        const data = await response.json();

                        if (data.message) {

                          successToast(data.message);
                        }

                        if (data.error) {

                          errorToast(data.error);
                        }

                      }}
                      className="disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/button w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_35px_rgba(255,215,0,0.35)]"
                    >

                      <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/button:translate-x-[100%] transition duration-700" />

                     <span className="relative z-10">

                        {

                          status === "UPCOMING"
                          ? "JOIN MATCH"

                          : status === "LIVE"
                          ? "MATCH LIVE"

                          : "MATCH ENDED"

                        }

                      </span>

                    </button>

                  </div>

                );
              })}

            </div>

          </div>

        </section>
        
        {/* Help section */}
        <section className="px-6 pb-20">

          <div
            className="
            max-w-7xl
            mx-auto
            rounded-[40px]
            border
            border-yellow-500/10
            bg-white/5
            backdrop-blur-xl
            p-10
            "
          >

            <h2 className="text-4xl font-black text-yellow-400 mb-5">

              NEED HELP?

            </h2>

            <p className="text-gray-300 text-lg leading-relaxed mb-8">

              Facing payment issues, room problems or tournament errors?
              Contact support anytime.

            </p>

            <div className="flex flex-wrap gap-5">

              <a

                href="https://wa.me/917202920648"

                target="_blank"

                className="
                px-8 py-4
                rounded-2xl
                bg-green-500
                text-black
                font-black
                hover:scale-105
                transition-all
                "

              >

                WhatsApp Support

              </a>

            <a
              href="mailto:support@ffarena.com"

              className="
              px-8 py-4
              rounded-2xl
              border border-yellow-500/20
              bg-white/5
              hover:bg-yellow-500
              hover:text-black
              transition-all
              inline-block
              font-bold
              "

            >

              Email Support

            </a>

            </div>

          </div>

        </section>

        {/* Footer */}
        <footer className="border-t border-yellow-500/10 py-8 text-center text-gray-500 backdrop-blur-xl bg-black/20">

            © 2026 FF Arena. All Rights Reserved.

            <br />
            FF Arena™ is an independent esports platform
            and is not affiliated with Garena Free Fire.
            <br />

            Unauthorized copying, reproduction,
            distribution, or cloning of this platform
            is strictly prohibited.

        </footer>

      </div>
      
  {/* Animation Styles */}
  <style>
  {`

  @keyframes planeFly {

    0% {
      transform: translateX(-400px) translateY(0px);
    }

    25% {
      transform: translateX(25vw) translateY(-20px);
    }

    50% {
      transform: translateX(55vw) translateY(15px);
    }

    75% {
      transform: translateX(85vw) translateY(-10px);
    }

    100% {
      transform: translateX(130vw) translateY(20px);
    }

  }

  @keyframes playerDrop1 {

    0% {
      transform: translateY(-150px) translateX(0px) rotate(0deg);
      opacity: 0;
    }

    10% {
      opacity: 1;
    }

    100% {
      transform: translateY(120vh) translateX(80px) rotate(20deg);
      opacity: 0;
    }

  }

  @keyframes playerDrop2 {

    0% {
      transform: translateY(-200px) translateX(0px) rotate(0deg);
      opacity: 0;
    }

    10% {
      opacity: 1;
    }

    100% {
      transform: translateY(120vh) translateX(-100px) rotate(-20deg);
      opacity: 0;
    }

  }

  @keyframes playerDrop3 {

    0% {
      transform: translateY(-120px) translateX(0px);
      opacity: 0;
    }

    10% {
      opacity: 1;
    }

    100% {
      transform: translateY(120vh) translateX(60px);
      opacity: 0;
    }

  }

  @keyframes playerDrop4 {

    0% {
      transform: translateY(-180px) translateX(0px);
      opacity: 0;
    }

    10% {
      opacity: 1;
    }

    100% {
      transform: translateY(120vh) translateX(-70px);
      opacity: 0;
    }

  }

  `}
</style>

    </div>
  );
};



export default Home;
