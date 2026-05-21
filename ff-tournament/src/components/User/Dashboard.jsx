import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Wallet,
  Trophy,
  Target,
  Gamepad2,
  LogOut,
  Medal,
  Swords,
  Flame,
  Star,
} from "lucide-react";

import {
  successToast,
  errorToast,
} from "../../Utils/showToast";

const Dashboard = () => {

  const gameModes = [
    "All",
    "Clash Squad",
    "Battle Royale",
    "Bomb Squad 5v5",
    "Lone Wolf",
    "Solo",
    "Duo",
  ];

  // set amout part
  const [showAddCashModal, setShowAddCashModal] = useState(false);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [confirmUpiId, setConfirmUpiId] = useState("");

  const [amount, setAmount] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [upiId, setUpiId] = useState("");

  const [screenshot, setScreenshot] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);


  
  const [selectedMode, setSelectedMode] = useState("All");

  const [currentTime, setCurrentTime] = useState(new Date());

  const [allMatches, setAllMatches] = useState([]);

  const [joinedMatches, setJoinedMatches] = useState([]);

  const [selectedTab, setSelectedTab] = useState("my");

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [selectedTournament, setSelectedTournament] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [resultData, setResultData] = useState(null);

  const [teamData, setTeamData] = useState("");

  // History data
  const [matchHistory, setMatchHistory] = useState([]);

  const [showWalletHistory, setShowWalletHistory] = useState(false);

  const [walletHistory, setWalletHistory] = useState([]);

  // Edit Options
  const [profileImage, setProfileImage] = useState(null);
  
  const [editingName, setEditingName] = useState(false);

  const [newName, setNewName] = useState(user?.name || "");

  const [joining, setJoining] = useState(false);


  const updateWallet = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.wallet && data.wallet !== 0) return;

      setUser((prev) => ({
        ...prev,
        wallet: data.wallet,
      }));
    } catch (err) {
      console.log("wallet fetch error", err);
    }
  };
    
  useEffect(() => {
    const interval = setInterval(() => {
      updateWallet();
    }, 9000);
    
    return () => clearInterval(interval);
  }, []);
 
  // Update Name
  const updateName = async () => {

    if (!newName.trim()) {

      errorToast("Enter valid name");

      return;

    }

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/update-name`,

        {

          method: "POST",

          headers: {

            "Content-Type":
            "application/json"

          },

          body: JSON.stringify({

            email: user.email,

            name: newName

          })

        }

      );

      const data = await response.json();

      if (data.error) {

        errorToast(data.error);

        return;

      }

      const updatedUser = {

        ...user,

        name: newName

      };

      localStorage.setItem(

        "user",

        JSON.stringify(updatedUser)

      );

      setUser(updatedUser);

      setEditingName(false);

      successToast(
        "Name updated successfully ✅"
      );

    }

    catch {

      errorToast("Server Error");

    }

  };


  // update profile pic
  const uploadProfilePic = async (file) => {

    try {

      const formData = new FormData();

      formData.append("email", user.email);

      formData.append("profile_pic", file);

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/upload-profile`,

        {
          method: "POST",

          body: formData
        }

      );

      const data = await response.json();

      if (data.error) {

        errorToast(data.error);

        return;

      }

      // UPDATE USER
      const updatedUser = {

        ...user,

        profile_pic: data.profile_pic

      };

      localStorage.setItem(

        "user",

        JSON.stringify(updatedUser)

      );

      setUser(updatedUser);

      successToast(
        "Profile picture updated ✅"
      );

    }

    catch {

      errorToast("Upload Failed");

    }

  };


  
  // add cash
  const submitAddCash = async () => {

    if (!amount || !screenshot) {

      errorToast("Fill all fields");

      return;

    }

     if (Number(amount) < 20) {

      errorToast("Minimum Add Amount is ₹20+")

      return;

    }

    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("email", user.email);

    formData.append("amount", amount);

    formData.append("screenshot", screenshot);

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/add-cash`,

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

        setIsSubmitting(false);

        return;

      }

      successToast(data.message);

      setShowAddCashModal(false);

      setAmount("");

      setScreenshot(null);

    }

    catch {

      errorToast("Server Error");

    }

    finally {

      setIsSubmitting(false);

    }

  };


 
  // withdraw cash
  const submitWithdraw = async () => {

    if (!withdrawAmount || !upiId) {

      errorToast("Fill all fields");

      return;

    }
  
    if (upiId !== confirmUpiId) {

      errorToast("UPI ID Does Not Match");

      return;

    }

    if (Number(withdrawAmount) > user.wallet) {

      errorToast("Insufficient Balance");

      return;

    }

    if (Number(withdrawAmount) < 50) {

      errorToast("Minimum Withdraw Amount is ₹50+")

      return;

    }

    if (Number(withdrawAmount) > 5000) {

      errorToast("Maximum Withdraw Amount is ₹5000")

      return;

    }

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/withdraw-request`,

        {

          method: "POST",

          headers: {

            "Content-Type":
            "application/json",

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          },

          body: JSON.stringify({

            email: user.email,

            amount: withdrawAmount,

            upi_id: upiId

          })

        }

      );

      const data = await response.json();

      // =========================
      // ERROR
      // =========================

      if (data.error) {

        errorToast(data.error);

        return;

      }

      // =========================
      // SUCCESS
      // =========================

      successToast(data.message);

      setShowWithdrawModal(false);

      setWithdrawAmount("");

      setUpiId("");

      setConfirmUpiId("");

    }

    catch {

      errorToast("Server Error");

    }

  };

  const fetchTournaments = async () => {

    try {

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/tournaments`
      );

      const data = await res.json();

      setAllMatches(data);

      // UPDATE MODAL DATA ALSO
      if (selectedTournament) {

        const updatedTournament = data.find(
          (t) => t._id === selectedTournament._id
        );

        if (updatedTournament) {

          setSelectedTournament(updatedTournament);

        }

      }

    } catch (error) {

      console.log("Tournament fetch error");

    }

  };
  
  

  // for time
  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentTime(new Date());

    }, 1000);

    return () => clearInterval(interval);

  }, []);
  
  useEffect(() => {

    const savedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (!savedUser) return;

    setUser(savedUser);

    // FIRST LOAD
    fetchTournaments();

    fetch(`${import.meta.env.VITE_API_URL}/my-tournaments/${savedUser.email}`)

    .then((res) => res.json())

    .then((data) => {

      setJoinedMatches(data);

    });
    // AUTO UPDATE PLAYERS
    const interval = setInterval(() => {

      fetchTournaments();

    }, 3000);

    fetch(`${import.meta.env.VITE_API_URL}/match-history/${savedUser.email}`)
      .then((res) => res.json())
      .then((data) => {

        setMatchHistory(data);

      });
    
    fetch(`${import.meta.env.VITE_API_URL}/transactions/${savedUser.email}`)
      .then((res) => res.json())
      .then((data) => {

        setWalletHistory(data);

    });
  }, []);

  useEffect(() => {

  if (!selectedTournament) return;

  const interval = setInterval(async () => {

    try {

      const res = await fetch(

        `${import.meta.env.VITE_API_URL}/tournament/${selectedTournament._id}`

      );

      const data = await res.json();

      setSelectedTournament(data);

    }

    catch (error) {

      console.log(error);

    }

  }, 3000);

  return () => clearInterval(interval);

}, [selectedTournament]);

  const joinTournament = async (
    tournamentId
  ) => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      const token = localStorage.getItem("token");

      if (!token) { errorToast("Login Required"); return; }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/join-tournament`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({

            email: user.email,

            tournament_id: tournamentId,

            ingame_name: teamData

          }),
        }
      );

      const data = await response.json();

      if (data.error) {

        errorToast(data.error);

        return;

      }

      // UPDATE USER
      const updatedUser = {

        ...user,

        wallet: data.wallet,

        matches:
          (user.matches || 0) + 1

      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);

      // REFRESH MY MATCHES
      fetch(
        `${import.meta.env.VITE_API_URL}/my-tournaments/${user.email}`
      )
      .then((res) => res.json())
      .then((data) => {

        setJoinedMatches(data);

      });

      successToast(
        "Tournament Joined 🔥"
      );

      setShowModal(false);

    }

    catch (error) {

      errorToast("Server Error");

    }

  };

  const baseMatches =
    selectedTab === "my"
      ? joinedMatches
      : allMatches;

  const matchesToShow =
    selectedMode === "All"
      ? baseMatches
      : baseMatches.filter(
          (match) =>
            match.game_mode === selectedMode
        );

  // Logout
  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("loginTime");

    successToast("Logged Out");

    setTimeout(() => {

      navigate("/", {
        replace: true
      });

    }, 1000);

  };

  if (!user) {

    return null;

  }

  const matchesPlayed = user?.matches || 0;

  const totalWins = user?.wins|| 0;

  // LEVEL LOGIC
  let level = 1;

  let requiredMatches = 1;

  while (matchesPlayed >= requiredMatches) {

    level++;

    requiredMatches =
      (level * (level + 1)) / 2;

  }

  // Previous Level Requirement
  const previousRequirement =
    ((level - 1) * level) / 2;
  
  // Current Level Progress
  const currentXP =
    matchesPlayed - previousRequirement;

  // Needed For Next Level
  const nextLevelXP =
    requiredMatches - previousRequirement;

  // Progress %
  const xpPercent =
    (currentXP / nextLevelXP) * 100;


  // RANK LOGIC
  let rank = "BRONZE";

  if (totalWins >= 5) {

    rank = "SILVER";

  }

  if (totalWins >= 15) {

    rank = "GOLD";

  }

  if (totalWins >= 30) {

    rank = "DIAMOND";

  }

  if (totalWins >= 50) {

    rank = "HEROIC";

  }

  // CREATE LIVE MATCH ARRAY
  const liveMatches = joinedMatches.filter(
    (match) => {

      const now = currentTime;

      const startTime = new Date(
        match.match_time
      ).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
      });
      const diff =
        (startTime - now) / 1000 / 60;

      return diff <= 10 && diff >= -10;

    }
  );

  // if user already join.
  const isJoined = (matchId) => {

    return joinedMatches.some(
      (match) => match._id === matchId
    );

  };

  return (

    <div className="relative min-h-screen overflow-hidden bg-black text-white scrollbar-hide overflow-y-scroll">

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(255,180,0,0.18), transparent 35%), radial-gradient(circle at bottom, rgba(255,0,0,0.15), transparent 35%)"
        }}
      />

      {/* Glow */}
      <div className="absolute top-0 left-[10%] w-96 h-96 bg-yellow-500/20 blur-[150px] rounded-full animate-pulse" />

      <div className="absolute bottom-0 right-[10%] w-[500px] h-[500px] bg-red-500/20 blur-[180px] rounded-full animate-pulse" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main */}
      <div className="relative z-10">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-5 border-b border-yellow-500/10 backdrop-blur-md bg-black/30 sticky top-0 z-50">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.5)]">

              <Gamepad2 className="text-black w-6 h-6" />

            </div>

            <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-300 to-orange-500 bg-clip-text text-transparent">
              FF ARENA
            </h1>

          </div>
          {
            user?.is_admin && (

              <button

                onClick={() => navigate("/admin")}

                className="
                px-5 py-2
                rounded-2xl
                bg-gradient-to-r
                from-yellow-400
                to-orange-500
                text-black
                font-black
                shadow-[0_0_25px_rgba(255,215,0,0.5)]
                hover:scale-105
                transition-all
                duration-300
                "

              >

                👑 ADMIN PANEL

              </button>

            )
          }

          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500/20 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
          >

            <LogOut className="w-5 h-5" />

            Logout

          </button>

        </nav>

        {/* Profile */}
        <section className="max-w-7xl mx-auto px-6 py-10 scrollbar-hide overflow-y-scroll">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 scrollbar-hide overflow-y-scroll">

            {/* LEFT */}
            <div className="rounded-[35px] border border-yellow-500/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(255,215,0,0.08)]">

              <div className="flex flex-col items-center text-center">

                <div className="relative w-36 h-36 mb-5 group">

                  {/* IMAGE */}
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-yellow-400 shadow-[0_0_40px_rgba(255,215,0,0.35)]">

                    <img
                      src={
                        user?.profile_pic
                          ? `${user.profile_pic}`
                          : "https://i.pravatar.cc/300"
                      }
                      alt="profile"
                      className="w-full h-full object-cover"
                    />

                  </div>

                  {/* EDIT BUTTON */}
                  <label className="absolute bottom-2 right-2 bg-yellow-400 hover:bg-yellow-300 text-black p-2 rounded-full cursor-pointer shadow-lg transition-all duration-300">

                    ✏️

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {

                        const file = e.target.files[0];

                        if (file) {

                          uploadProfilePic(file);

                        }

                      }}
                    />

                  </label>

                </div>

                <div className="flex items-center gap-3 mb-2"> 
                   {editingName ? (

                      <input
                        type="text"
                        value={newName}
                        onChange={(e) =>
                          setNewName(e.target.value)
                        }
                        className="bg-black/40 border border-yellow-500/20 rounded-2xl ml-5 px-2 py-2 text-yellow-400 text-[20px] font-black outline-none"
                      />

                    ) : (

                      <h2 className="text-4xl font-black text-yellow-400">

                        {user.name}

                      </h2>

                  )}

                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => {

                      if (editingName) {

                        updateName();

                      } else {

                        setEditingName(true);

                      }

                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-1 py-1 rounded-full font-bold transition-all duration-300"
                  >

                    {editingName ? "✔" : "✏️"}

                  </button>

                </div>

                <p className="text-gray-400 mb-2">
                  {user.email}
                </p>               

                {/* Rank */}
                <div className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg shadow-[0_0_30px_rgba(255,215,0,0.35)]">

                  🔥 Elite Warrior  

                </div>

              </div>

            </div>

            {/* RIGHT */}
            <div className="lg:col-span-2 space-y-8">

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Wallet */}
                <div
                  onClick={() =>
                    setShowWalletHistory(true)
                  }
                  className="rounded-[30px] bg-white/5 border border-yellow-500/10 p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-5">

                    <Wallet className="text-yellow-400 w-10 h-10" />

                    <span className="text-green-400 font-bold">
                      LIVE
                    </span>

                  </div>

                  <h3 className="text-gray-400 text-lg mb-2">
                    Wallet Balance
                  </h3>

                  <h1 className="text-5xl font-black text-yellow-400">
                    ₹{user.wallet || 0}
                  </h1>

                </div>

                {/* Matches */}
                <div className="rounded-[30px] bg-white/5 border border-yellow-500/10 p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300">

                  <div className="flex items-center justify-between mb-5">

                    <Swords className="text-red-400 w-10 h-10" />

                    <Flame className="text-orange-400 w-6 h-6 animate-pulse" />

                  </div>

                  <h3 className="text-gray-400 text-lg mb-2">
                    Matches Played
                  </h3>

                  <h1 className="text-5xl font-black text-white">
                    {user.matches || 0}
                  </h1>

                </div>

                {/* Wins */}
                <div className="rounded-[30px] bg-white/5 border border-yellow-500/10 p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300">

                  <div className="flex items-center justify-between mb-5">

                    <Trophy className="text-yellow-400 w-10 h-10" />

                    <Star className="text-yellow-300 w-6 h-6 animate-spin" />

                  </div>

                  <h3 className="text-gray-400 text-lg mb-2">
                    Total Wins
                  </h3>

                  <h1 className="text-5xl font-black text-yellow-400">
                    {user.wins || 0}
                  </h1>

                </div>

              </div>

              {/* Match History */}
              <div className="rounded-[35px] border border-yellow-500/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(255,215,0,0.08)]">

                <div className="flex items-center justify-between mb-8">

                  <h2 className="text-4xl font-black text-yellow-400">
                    RECENT MATCHES
                  </h2>

                  <Target className="text-red-400 w-8 h-8" />

                </div>

                <div className="space-y-5">

                  {matchHistory.length === 0 ? (

                    <div className="text-center py-10 text-gray-500">

                      No Match History

                    </div>

                  ) : (

                    <>
                    
                      {matchHistory.map((match, index) => (

                        <div
                          key={index}
                          className="flex items-center justify-between p-5 rounded-2xl bg-black/30 border border-gray-800 hover:border-yellow-500/20 transition-all duration-300"
                        >

                          <div>

                            <h3 className="text-2xl font-bold text-white mb-1">

                              {match.tournament_title}

                            </h3>

                            <p className="text-gray-400">

                              Total Point #{match.total_points} •
                              {match.kills} Kills

                            </p>

                          </div>

                          <div className="text-right">

                            <div
                              className={`font-black text-xl ${
                                match.result === "WON"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >

                              {match.result}

                            </div>

                            <div className="text-gray-500">

                              ₹{match.win_amount}

                            </div>

                          </div>

                        </div>

                      ))}

                      {/* NOTE */}
                      <p className="text-center text-gray-500 text-sm mt-5">

                        ⚠ Match history will be automatically removed after 7 days.

                      </p>

                    </>

                  )}

                </div>

              </div>              

            </div>            

          </div>
          
          {/* Top Dashboard Grid */}
          <div className=" mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">

           {/* LEVEL */}
            <div className="rounded-[30px] bg-white/5 border border-cyan-500/10 p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300">

              <div className="flex items-center justify-between mb-5">

                <Medal className="text-cyan-400 w-10 h-10" />

                <span className="text-cyan-300 font-bold">
                  LEVEL
                </span>

              </div>

              <h3 className="text-gray-400 text-lg mb-2">
                Player Level
              </h3>

              <h1 className="text-5xl font-black text-cyan-400 mb-4">
                {level}
              </h1>

              {/* XP BAR */}
              <div className="w-full h-4 rounded-full bg-black/40 overflow-hidden">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                  style={{
                    width: `${xpPercent}%`
                  }}
                />

              </div>

              <p className="text-gray-500 text-sm mt-2">
                {currentXP}/{nextLevelXP} XP
              </p>

            </div>

            {/* RANK */}
            <div className="rounded-[30px] bg-white/5 border border-yellow-500/10 p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300">

              <div className="flex items-center justify-between mb-5">

                <Trophy className="text-yellow-400 w-10 h-10" />

                <Star className="text-yellow-300 w-6 h-6 animate-spin" />

              </div>

              <h3 className="text-gray-400 text-lg mb-2">
                Current Rank
              </h3>

              <h1 className="text-5xl font-black text-yellow-400">
                {rank}
              </h1>

              <p className="text-gray-500 mt-3">
                {totalWins} Wins
              </p>

            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-[35px] border border-red-500/20 bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(255,0,0,0.12)]">

              <h2 className="text-3xl font-black text-red-400 mb-6">
                QUICK ACTIONS
              </h2>

              <div className="grid grid-cols-2 gap-4">

                <button onClick={() => setShowAddCashModal(true)}
                  className="py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-black font-black hover:scale-105 transition-all">
                  ADD CASH
                </button>

                <button onClick={() => setShowWithdrawModal(true)}
                 className="py-4 rounded-2xl bg-gradient-to-r from-red-400 to-orange-500 text-black font-black hover:scale-105 transition-all">
                  WITHDRAW
                </button>

                <button
                  onClick={() => setSelectedTab("my")}
                  className={`p-4 rounded-2xl font-bold ${
                    selectedTab === "my"
                      ? "bg-green-500 text-black"
                      : "bg-white/10"
                  }`}
                >
                  MY MATCHES
                </button>

                <button
                  onClick={() => setSelectedTab("all")}
                  className={`p-4 rounded-2xl font-bold ${
                    selectedTab === "all"
                      ? "bg-blue-500 text-black"
                      : "bg-white/10"
                  }`}
                >
                  ALL MATCHES
                </button>

              </div>

            </div>

          </div>

          {liveMatches.length > 0 && (

            <div className="mt-8 space-y-6">

              {liveMatches.map((match, index) => (

                <div
                  key={index}
                  className="rounded-[35px] border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(0,255,120,0.12)]"
                >

                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

                    <div>

                      <div className="flex items-center gap-3 mb-4">

                        <div className="w-4 h-4 rounded-full bg-green-400 animate-ping" />

                        <h2 className="text-4xl font-black text-green-400">
                          LIVE MATCH READY
                        </h2>

                      </div>

                      <p className="text-gray-300 text-lg mb-2">
                        {match.title}
                      </p>

                      <p className="text-gray-500">
                        Room Opened
                      </p>

                    </div>

                    <div className="grid grid-cols-2 gap-6">

                      <div className="rounded-2xl bg-black/40 px-8 py-5 text-center border border-green-500/20">

                        <p className="text-gray-400 mb-2">
                          ROOM ID
                        </p>

                        <h1 className="text-3xl font-black text-green-400">
                          {match.room_id}
                        </h1>

                      </div>

                      <div className="rounded-2xl bg-black/40 px-8 py-5 text-center border border-yellow-500/20">

                        <p className="text-gray-400 mb-2">
                          PASSWORD
                        </p>

                        <h1 className="text-3xl font-black text-yellow-400">
                          {match.room_password}
                        </h1>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

          <div className="mt-8 flex gap-4 overflow-x-auto scrollbar-hide pb-2">

            {gameModes.map((mode, index) => (

              <button
                key={index}
                onClick={() => setSelectedMode(mode)}
                className={`
                  px-6 py-3 rounded-2xl whitespace-nowrap font-bold transition-all duration-300
                  ${
                    selectedMode === mode
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }
                `}
              >

                {mode}

              </button>

            ))}

          </div>

          {/* TOURNAMENT SECTION */}
          <div className="mt-8 rounded-[35px] border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(180,0,255,0.12)]">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">

              <h2 className="text-4xl font-black text-purple-300">

                {selectedTab === "my"
                  ? "MY TOURNAMENTS"
                  : "ALL TOURNAMENTS"}

              </h2>

              <Trophy className="w-10 h-10 text-yellow-400 animate-pulse" />

            </div>

            {/* NO MATCH */}
            {matchesToShow.length === 0 && (

              <div className="text-center py-20">

                <h2 className="text-3xl font-black text-gray-500 mb-3">

                  {selectedTab === "my"
                    ? "NO TOURNAMENTS JOINED"
                    : "NO TOURNAMENTS AVAILABLE"}

                </h2>

                <p className="text-gray-600">

                  {selectedTab === "my"
                    ? "Join tournaments to see them here"
                    : "Admin has not added tournaments yet"}

                </p>

              </div>

            )}

            {/* TOURNAMENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {matchesToShow.map((tournament, index) => {
                // Status
                // AUTO STATUS SYSTEM
                let status = tournament.status?.toUpperCase() || "UPCOMING";
                
                const now = currentTime.getTime();

                const startTime = new Date(
                  tournament.match_time
                ).getTime();                

                // Minutes Difference
                const diff =
                  (startTime - now) / 60000;
                // For Open Close.
                const isJoinClosed = diff <= 10;

                // Show Room Before 10 Min
                const canShowRoom =
                  diff <= 10 ;                
 
                // USER JOINED 
                const joined = isJoined(tournament._id);                

                //MATCH COMPLETED 
                const isCompleted = status === "COMPLETED";
                

                return (

                  <div
                    key={index}
                    className="relative overflow-hidden rounded-3xl border border-purple-500/10 bg-black/30 p-6 hover:scale-[1.02] transition-all duration-300 hover:border-purple-400/30">

                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 hover:opacity-100 transition-all duration-500" />

                    <div className="relative z-10">

                      {/* Header */}
                      <div className="flex items-center justify-between mb-5">

                        <h3 className="text-3xl font-black text-white">
                          {tournament.title}
                        </h3>

                        <span
                          className={`
                            px-4 py-2 rounded-full text-sm font-bold
                            ${
                              
                              status === "LIVE"
                                ? "bg-green-500/20 text-green-400 animate-pulse"

                              : status === "COMPLETED"
                                ? "bg-red-500/20 text-red-400"

                              : status === "CANCELLED"
                                ? "bg-gray-500/20 text-gray-300"

                              : "bg-yellow-500/20 text-yellow-400"

                            }
                          `}
                        >

                          {status}

                        </span>

                      </div>

                      {/* Info */}
                      <div className="space-y-3 text-gray-300 mb-6">

                        <p>
                          🎟 Entry Fee:
                          <span className="ml-2 text-yellow-400 font-bold">
                            {tournament.entry_fee == 0
                              ? "Free"
                              : "₹ "+ tournament.entry_fee
                            }
                          </span>
                        </p>

                        <p>
                          🏆 Prize Pool:
                          <span className="ml-2 text-green-400 font-bold">
                            ₹{tournament.prize}
                          </span>
                        </p>

                        <p>
                          👥 Players:
                          <span className="ml-2 text-white">
                             {Number(tournament.joined_players) || 0}
                              /
                              {Number(tournament.players) || 0}

                          </span>
                        </p>

                        <p>
                          ⏰ Starts At:
                          <span className="ml-2 text-cyan-400 font-bold">

                            {tournament.match_time
                              ? new Date(
                                  tournament.match_time
                                ).toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata"
                                })
                                
                              
                              : "Not Scheduled"}
                            

                          </span>
                        </p>

                      </div>

                      {/* ROOM DETAILS ONLY FOR MY MATCHES */}
                      {selectedTab === "my" && (

                        <div className="mb-6">

                          {status === "COMPLETED" ? (

                            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5 text-center">

                              <p className="text-red-400 font-bold text-lg">
                                Match Completed
                              </p>

                            </div>

                          ) : status === "CANCELLED" ? (

                            <div className="rounded-2xl bg-gray-500/10 border border-gray-500/20 p-5 text-center">

                              <p className="text-gray-300 font-bold text-lg">
                                Match Cancelled
                              </p>

                            </div>

                          ) :canShowRoom ? (

                            <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-5">

                              <p className="text-green-400 font-black mb-4">
                                ROOM DETAILS UNLOCKED
                              </p>

                              <div className="grid grid-cols-2 gap-4">

                                <div className="rounded-2xl bg-black/40 border border-yellow-500/20 p-4 text-center">

                                  <p className="text-gray-500 text-sm mb-1">
                                    ROOM ID
                                  </p>

                                  <h2 className="text-2xl font-black text-yellow-400">
                                    {tournament.room_id || "WAIT.."}
                                  </h2>

                                </div>

                                <div className="rounded-2xl bg-black/40 border border-green-500/20 p-4 text-center">

                                  <p className="text-gray-500 text-sm mb-1">
                                    PASSWORD
                                  </p>

                                  <h2 className="text-2xl font-black text-green-400">
                                    {tournament.room_password || "WAIT.."}
                                  </h2>

                                </div>

                              </div>

                            </div>

                          ) : (

                            <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-5 text-center">

                              <p className="text-yellow-400 font-bold text-lg">

                                Room details will unlock
                                10 minutes before match

                              </p>

                            </div>

                          )}

                        </div>

                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">

                        {selectedTab === "my" ? (

                          <span className="px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">

                            JOINED ✅

                          </span>

                        ) : (

                          <span
                            className={`px-5 py-2 rounded-full font-bold border
                              ${
                                isJoinClosed || isCompleted
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                              }
                            `}
                          >
                            {isJoinClosed || isCompleted ? "CLOSED ❌" : "OPEN 🔥"}
                          </span>

                        )}
                       
                        {/* BUTTON SECTION */}
                        {status === "COMPLETED" ? (

                          isJoined(tournament._id) ? (

                            <button
                              onClick={() => {

                                setSelectedTournament(tournament);

                                setShowModal(true);

                              }}
                              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black hover:scale-105 transition-all duration-300"
                            >

                              VIEW RESULT

                            </button>

                          ) : (

                            <div className="px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black">

                              MATCH OVER

                            </div>

                          )

                        ) : (

                          <button
                            onClick={() => {

                              setSelectedTournament(tournament);

                              setShowModal(true);

                            }}

                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black hover:scale-105 transition-all duration-300"
                          >

                            VIEW MATCH

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                );

              })
            }

            </div>

          </div>
        
        {showModal && selectedTournament && (() => {
          
          const now = currentTime.getTime();

          const startTime = new Date(
            selectedTournament.match_time
          ).getTime();
            
          const diff =
            (startTime - now) / 60000;

            const canJoin = diff > 10;
            
          // MATCH STATUS
          const isCompleted = selectedTournament.status === "completed";
            
          // CANCELLED
          const isCancelled =
            selectedTournament.status === "cancelled";

          // USER JOINED
          const joined = isJoined(
            selectedTournament._id
            );
          
          // ============================
          // SLOT SYSTEM 🔥
          // ============================

          // total slots
          const totalSlots = selectedTournament.players || 0;

          // backend players
          const playersList = selectedTournament.joined_players_list || [];

          // convert to map for fast lookup
          const slotMap = {};
          playersList.forEach((p) => {
            slotMap[p.slot] = p.name;
          });
            
          const showResultOnly = isCompleted && joined && !isCancelled;
            
          const isSolo =
            selectedTournament.title
              .toLowerCase()
                .includes("solo");
          
            const playersCount =
            selectedTournament.joined_players_list?.length ??
            selectedTournament.joined_players ??
            0;
                    
          return (

            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm scrollbar-hide flex items-center justify-center p-4 overflow-y-auto">

              <div className="w-full max-w-2xl max-h-[90vh] rounded-[35px] bg-gray-900 border border-purple-500/20 p-8 relative scrollbar-hide overflow-y-scroll">
              
                {/* CLOSE */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-400"
                >
                  ×
                </button>

                {/* TITLE */}
                <h2 className="text-4xl font-black text-purple-300 mb-6">

                  {selectedTournament.title}

                </h2>

                
                {/* PLAYER SLOT SECTION */}
                {!isCompleted && joined &&(

                  <div className="mb-6 rounded-3xl border border-green-500/20 bg-green-500/5 p-5">

                    <h2 className="text-2xl font-black text-green-400 mb-5">
                      PLAYER SLOTS
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                      {Array.from({ length: totalSlots }, (_, i) => { const slotNumber = i + 1; const player = playersList.find( (p) => p.slot === slotNumber ); return (

                          <div key={slotNumber} className={` p-4 rounded-2xl border text-center ${player ? "bg-green-500/10 border-green-500/30" : "bg-black/30 border-gray-700" } `} >

                            <div className="text-sm text-gray-400"> Slot #{slotNumber} </div> {player ? ( <div className="text-green-400 font-bold mt-2"> {player.name} </div> ): (

                              <div className="text-gray-500 mt-2"> Empty </div> )} </div> ); })}

                    </div>

                    <div className="mt-4 text-gray-400 text-sm">
                      {playersList.length}/{totalSlots} slots filled
                    </div>

                  </div>

                )}

                {/* RESULT SECTION */}
                {showResultOnly ? (

                  selectedTournament.result_image ? (

                    <div className="mb-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-5">

                      <h2 className="text-2xl font-black text-yellow-400 mb-5">

                        MATCH RESULT

                      </h2>

                      <img
                        src={
                          `${selectedTournament.result_image}`
                        }
                        alt="result"
                        className="rounded-3xl w-full border border-yellow-500/20"
                      />

                    </div>

                  ): (

                  <div className="space-y-6">

                    <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 text-center">

                      <h2 className="text-4xl font-black text-yellow-400 mb-4">
                        MATCH RESULT
                      </h2>

                      <p className="text-gray-400">
                        Tournament Result comming soon..
                      </p>

                    </div>

                      </div>
                  )

                ) : (

                  <>
                  
                    {/* INFO */}
                    <div className="space-y-4 text-lg text-gray-300 mb-8">

                      <p>
                        🎟 Entry Fee:
                        <span className="ml-2 text-yellow-400 font-bold">
                          {selectedTournament.entry_fee == 0 
                            ? "Free"
                            :"₹ " + selectedTournament.entry_fee
                          }
                        </span>
                      </p>

                      <p>
                        🏆 Prize Pool:
                        <span className="ml-2 text-green-400 font-bold">
                          ₹{selectedTournament.prize}
                        </span>
                      </p>

                      <p>
                        👥 Players:
                        <span className="ml-2 text-white">
                          {playersCount}/{selectedTournament.players}
                        </span>
                      </p>

                      <p>
                        ⏰ Match Time:
                        <span className="ml-2 text-cyan-400 font-bold">

                          {selectedTournament.match_time
                            ? new Date(
                                selectedTournament.match_time
                              ).toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata"
                              })
                            : "Not Scheduled"}

                        </span>
                      </p>

                    </div>

                   {/* RULES */}
                  <div className="rounded-3xl bg-black/40 border border-yellow-500/10 p-6 mb-8">

                    <h3 className="text-2xl font-black text-yellow-400 mb-4">

                      MATCH RULES

                    </h3>

                    <ul className="space-y-3 text-gray-300">

                      {selectedTournament.rules?.length > 0 ? (

                        selectedTournament.rules.map((rule, index) => (

                          <li key={index}>

                            ✅ {rule}

                          </li>

                        ))

                      ) : (

                        <li>

                          No Rules Added

                        </li>

                      )}

                    </ul>

                  </div>
                  </>

                )}

                {/* JOIN BUTTON */}

                {/* MATCH COMPLETED */}
                {isCompleted ? (

                  joined ? (

                    <div className="space-y-5">

                      {/* JOINED STATUS */}
                      <div className="w-full mt-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-center text-green-400 font-black text-lg">

                        MATCH COMPLETED ✅

                      </div>

                    </div>

                  ) : (

                    <div className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center text-red-400 font-black text-lg">

                      MATCH OVER ❌

                    </div>

                  )

                ) : joined ? (

                  <div className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-950 to-pink-950 border border-green-500/20 text-center text-cyan-400 font-black text-lg">

                    JOINED ✅

                  </div>

                  ) : canJoin ? (
                    <>
                      <div className="mb-5">

                          <label className="block text-gray-300 mb-2 font-bold">

                            {isSolo
                              ? "Enter In Game Name"
                              : "Enter Team Name"}

                          </label>

                          <input
                            required
                            type="text"
                            value={teamData}
                            onChange={(e) =>
                              setTeamData(e.target.value)
                            }
                            placeholder={
                              isSolo
                                ? "Enter IGN"
                                : "Enter Team Name"
                            }
                            className="w-full rounded-2xl bg-black/40 border border-purple-500/20 p-4 text-white outline-none"
                          />

                      </div>

                      
                      <button
                        disabled={!teamData.trim() || joining}
                        onClick={async () => {

                          if (joining) return;

                          if (!teamData.trim()) {
                            errorToast("Enter name first");
                            return;
                          }

                          try {

                            setJoining(true);

                            await joinTournament(selectedTournament._id);

                          } finally {

                            setJoining(false);

                          }

                        }}

                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-300

                          ${
                            joining
                              ? "bg-gray-700 text-gray-300 cursor-not-allowed"

                            : teamData.trim()
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 text-white"

                              : "bg-gray-600 text-gray-300 cursor-not-allowed"
                          }
                        `}
                      >

                        {joining ? (

                          <div className="flex items-center justify-center gap-3">

                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                            JOINING...

                          </div>

                        ) : (

                          "JOIN TOURNAMENT"

                        )}

                      </button>
                    </>

                ) : (

                  <div className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center text-red-400 font-black text-lg">

                    JOINING CLOSED ❌

                  </div>

                )}

              </div>

            </div>

          );

          })()}

          {/* ADD CASH MODAL */}
          {showAddCashModal && (

            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

              <div className="scrollbar-hide overflow-y-auto w-full max-w-md rounded-3xl bg-gray-900 border border-green-500/20 p-8 max-h-[90vh] relative">

                <button
                  onClick={() => setShowAddCashModal(false)}
                  className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-400"
                >
                  ×
                </button>

                <h2 className="text-3xl font-black text-green-400 mb-6">

                  ADD CASH

                </h2>

                <input
                  type="number"
                  min="20"
                  placeholder="Enter Minimum amount is ₹20"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`

                    w-full
                    mb-2
                    rounded-2xl
                    bg-black/40
                    p-4
                    text-white
                    outline-none

                    ${amount && Number(amount) < 20

                      ? "border border-red-500"

                      : "border border-green-500/20"

                    }

                  `}
                />
                {/* ERROR */}
                {amount && Number(amount) < 20 && (

                  <p className="text-red-400 text-sm mb-4">

                    Minimum amount is ₹20

                  </p>

                )}

                <img
                  src="https://res.cloudinary.com/drrxe4qzt/image/upload/v1779270119/upi-qr_z70r4m.jpg"
                  alt="upi"
                  className="w-64 mx-auto rounded-2xl mb-5"
                />

               <label className="block mb-5">

                <span className="block text-gray-300 font-bold mb-3">

                  Upload Payment Screenshot

                </span>

                <div className="relative border-2 border-dashed border-green-500/30 rounded-3xl bg-black/30 hover:bg-black/40 transition-all duration-300 p-8 text-center cursor-pointer">

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setScreenshot(e.target.files[0])
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="space-y-3">

                    <div className="text-5xl">
                      📸
                    </div>

                    <p className="text-green-400 font-black text-lg">

                      {screenshot
                        ? screenshot.name
                        : "Click to Upload Screenshot"}

                    </p>

                    <p className="text-gray-500 text-sm">

                      JPG, PNG Supported

                    </p>

                  </div>

                </div>

              </label>

                <button

                  onClick={submitAddCash}

                  disabled={isSubmitting}

                  className={`

                    w-full
                    py-4
                    rounded-2xl
                    font-black
                    text-lg
                    transition-all
                    flex
                    items-center
                    justify-center
                    gap-3

                    ${isSubmitting

                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"

                      : "bg-gradient-to-r from-green-400 to-emerald-500 text-black"

                    }

                  `}

                >

                  {

                    isSubmitting ? (

                      <>

                        {/* SPINNER */}
                        <div
                          className="
                          w-5
                          h-5
                          border-2
                          border-white
                          border-t-transparent
                          rounded-full
                          animate-spin
                          "
                        />

                        VERIFYING PAYMENT...

                      </>

                    ) : (

                      "SUBMIT PAYMENT"

                    )

                  }

                </button>

              </div>

            </div>

          )}

          {/* WITHDRAW MODAL */}
          {showWithdrawModal && (

            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

              <div className=" scrollbar-hide overflow-y-auto w-full max-w-md rounded-3xl bg-gray-900 border border-red-500/20 p-8 relative">

                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-400"
                >
                  ×
                </button>

                <h2 className="text-3xl font-black text-red-400 mb-6">

                  WITHDRAW

                </h2>

                <input
                  type="number"
                  placeholder="Enter Amount"
                  value={withdrawAmount}
                  onChange={(e) =>
                    setWithdrawAmount(e.target.value)
                  }
                  className="w-full mb-5 rounded-2xl bg-black/40 border border-red-500/20 p-4 text-white outline-none"
                />

                <input
                  type="text"
                  placeholder="Enter UPI ID"
                  value={upiId}
                  onChange={(e) =>
                    setUpiId(e.target.value)
                  }
                  className="w-full mb-5 rounded-2xl bg-black/40 border border-red-500/20 p-4 text-white outline-none"
                />

                <input
                  type="text"
                  placeholder="Confirm UPI ID"
                  value={confirmUpiId}
                  onChange={(e) =>
                    setConfirmUpiId(e.target.value)
                  }
                  className="w-full mb-5 rounded-2xl bg-black/40 border border-red-500/20 p-4
                  text-white outline-none "
                />

                <button
                  onClick={submitWithdraw}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-400 to-orange-500 text-black font-black text-lg"
                >

                  REQUEST WITHDRAW

                </button>

              </div>

            </div>

          )}

          {/* Show Transaction History */}
          {showWalletHistory && (

            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

              <div className=" scrollbar-hide w-full max-w-3xl rounded-[35px] bg-gray-900 border border-yellow-500/20 p-8 relative max-h-[90vh] overflow-y-auto">

                {/* CLOSE */}
                <button
                  onClick={() =>
                    setShowWalletHistory(false)
                  }
                  className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-400"
                >
                  ×
                </button>

                {/* TITLE */}
                <h2 className="text-4xl font-black text-yellow-400 mb-8">

                  WALLET HISTORY

                </h2>

                {/* EMPTY */}
                {walletHistory.length === 0 ? (

                  <div className="text-center text-gray-500 py-10">

                    No Transactions Found

                  </div>

                ) : (

                  <div className="space-y-4">

                    {walletHistory.map((item, index) => (

                      <div
                        key={index}
                        className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-black/30 p-5"
                      >

                        <div>

                          <h3 className={`text-xl font-bold ${
                              item.type === "WITHDRAW" || item.status === "FAILED" || item.type === "Join Match"
                                ? "text-red-400"
                                : "text-green-400"
                            }`}>

                            {item.type == "ADD_CASH"
                              ? "ADD CASH"
                              : item.type
                            }

                          </h3>

                          <p className={`text-sm ${item.status.toUpperCase() === "RETRY"
                            ? "text-amber-300"
                            :"text-gray-400"                            
                          }`}>

                            {item.message}

                          </p>
                          <p className="text-sm  text-red-400">

                            {item.upi_id}

                          </p>

                          <p className="text-gray-600 text-xs mt-1">

                            {item.created_at}

                          </p>

                        </div>

                        <div className="text-right">

                          <h2
                            className={`text-2xl font-black ${
                              item.status.toUpperCase() !== "RETRY"
                                ? item.type === "WITHDRAW" || item.status === "FAILED" || item.type === "Join Match"? "text-red-400" : "text-green-400"
                                : "text-gray-400"
                            }`}
                          >

                            {item.status.toUpperCase() !== "RETRY" && item.status !== "FAILED"
                              ? (item.type === "WITHDRAW" || item.type === "Join Match"?"-₹":"+₹")
                              : "₹"
                            }

                            {item.amount}

                          </h2>

                          <p className="text-yellow-400 text-sm font-bold">

                            {item.status}

                          </p>

                        </div>

                      </div>

                    ))}
                    
                    {/* NOTE */}
                    <p className="text-center text-gray-500 text-sm pt-3">

                      ⚠ Wallet history will be automatically removed after 30 days.

                    </p>

                  </div>

                )}

              </div>

            </div>

          )}
          
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
            p-7
            
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

      </div>

    </div>

  );

};

export default Dashboard;