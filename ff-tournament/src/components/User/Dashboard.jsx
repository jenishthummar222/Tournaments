import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import logo from "../../assets/JK_Tournaments.png";

import {
  Wallet,
  Trophy,
  Target,
  Gamepad2,
  LogOut,
  Medal,
  Swords,
  Flame,
  Star,Menu, X 
} from "lucide-react";

import {
  successToast,
  errorToast,
} from "../../Utils/showToast";

import { apiFetch } from "../../Utils/api";

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
  const [showPaymentSection, setShowPaymentSection] = useState(false);

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

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("wallet");
  
   
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

      // USER BANNED
      if (data.detail === "Account banned") {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        errorToast("Account banned");

        window.location.href = "/login";

        return;

      }

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

      // USER BANNED
      if (data.detail === "Account banned") {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        errorToast("Account banned");

        window.location.href = "/login";

        return;

      }

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

  const refreshUser = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(

        `${import.meta.env.VITE_API_URL}/profile`,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      const data = await res.json();

      // USER BANNED
      if (data.detail === "Account banned") {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        errorToast("Account banned");

        window.location.href = "/login";

        return;

      }

      if (!data.error) {

        localStorage.setItem(

          "user",

          JSON.stringify(data)

        );

        setUser(data);

      }

    }

    catch (err) {

      console.log(err);

    }

  };

  useEffect(() => {

    refreshUser();

    const interval = setInterval(() => {

      refreshUser();

    }, 9000);

    return () => clearInterval(interval);

  }, []);
  
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

      // USER BANNED
      if (data.detail === "Account banned") {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        errorToast("Account banned");

        window.location.href = "/login";

        return;

      }

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

      // USER BANNED
      if (data.detail === "Account banned") {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        errorToast("Account banned");

        window.location.href = "/login";

        return;

      }

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

      // USER BANNED
      if (data.detail === "Account banned") {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        errorToast("Account banned");

        window.location.href = "/login";

        return;

      }

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
    refreshUser();
  }, []);

  useEffect(() => {

  if (!selectedTournament) return;

  const interval = setInterval(async () => {

    try {

      const res = await fetch(

        `${import.meta.env.VITE_API_URL}/tournament/${selectedTournament._id}`

      );

      const data = await res.json();

      // USER BANNED
      if (data.detail === "Account banned") {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        errorToast("Account banned");

        window.location.href = "/login";

        return;

      }

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

    if (joining) return;

    setJoining(true);

    try {

      const tournament = allMatches.find(
        (t) => t._id === tournamentId
      );

      const isSolo =
      tournament?.title
        ?.toLowerCase()
        .includes("solo");

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

            ingame_name: isSolo
              ? teamData
              : "",

            team_name: isSolo
              ? ""
              : teamData.team_name,

            members: isSolo
              ? []
              : teamData.members.filter(
                  m => m?.trim() !== ""
                )

          }),
        }
      );

      const data = await response.json();

      // USER BANNED
      if (data.detail === "Account banned") {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        errorToast("Account banned");

        window.location.href = "/login";

        return;

      }

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

  const matches = user?.matches || 0;

  let Prorank = "Bronze Warrior";
  let rankColor = "from-orange-400 to-yellow-500";

  if (matches >= 10) {

    Prorank = "Silver Killer";
    rankColor = "from-gray-300 to-gray-500";

  }

  if (matches >= 25) {

    Prorank = "Gold Dominator";
    rankColor = "from-yellow-400 to-orange-500";

  }

  if (matches >= 50) {

    Prorank = "Diamond Legend";
    rankColor = "from-cyan-400 to-blue-500";

  }

  if (matches >= 100) {

    Prorank = "Elite Conqueror";
    rankColor = "from-purple-500 to-pink-500";

  }

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

        <nav className="relative flex items-center justify-between px-4 sm:px-6 py-4 border-b border-yellow-500/10 backdrop-blur-md bg-black/30 sticky top-0 z-50">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.5)]">
              <img src={logo} className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <h1 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-yellow-300 to-orange-500 bg-clip-text text-transparent">
              FF ARENA
            </h1>
          </div>

          {/* RIGHT SIDE (MOBILE MENU BUTTON) */}
          <button
            className="sm:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          {/* DESKTOP ACTIONS */}
          <div className="hidden sm:flex items-center gap-4">

            {user?.is_admin && (
              <button
                onClick={() => navigate("/admin")}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black hover:scale-105 transition-all duration-300"
              >
                👑 ADMIN
              </button>
            )}

            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500/20 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>

          </div>

          {/* MOBILE DROPDOWN MENU */}
          {menuOpen && (
            <div className="absolute top-full right-4 mt-3 w-52 bg-black/90 border border-yellow-500/20 rounded-2xl p-4 flex flex-col gap-3 sm:hidden z-50">

              {user?.is_admin && (
                <button
                  onClick={() => {
                    navigate("/admin");
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 font-bold"
                >
                  👑 Admin Panel
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-bold flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

            </div>
            
          )}

        </nav>

        {/* Profile */}
        <section className="max-w-7xl mx-auto sm:px-6 sm:py-10 px-3 py-5 scrollbar-hide overflow-y-scroll">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 scrollbar-hide overflow-y-scroll">

            {/* LEFT */}
            <div className="rounded-[35px] border border-yellow-500/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(255,215,0,0.08)]">

              <div className="flex flex-col items-center text-center">

                <div className="relative w-36 h-36 mb-5 group">

                  {/* IMAGE */}
                  <div className="sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-yellow-400 shadow-[0_0_40px_rgba(255,215,0,0.35)]">

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
                        className="bg-black/40 border border-yellow-500/20 rounded-2xl ml-5 px-2 py-2  text-yellow-400 sm:text-[20px] font-black outline-none"
                      />

                    ) : (

                      <h2 className="sm:text-4xl text-2xl font-black text-yellow-400">

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
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-1 py-1 rounded-full sm:font-bold  transition-all duration-300"
                  >

                    {editingName ? "✔" : "✏️"}

                  </button>

                </div>

                <p className="text-gray-400 mb-2">
                  {user.email}
                </p>               

                {/* Rank */}
                <div
                  className={`

                    mt-6
                    px-6
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    ${rankColor}
                    text-black
                    font-black
                    sm:text-lg
                    text-base
                    shadow-[0_0_30px_rgba(255,215,0,0.35)]

                  `}
                >

                  🔥 {Prorank}

                </div>
                    
              </div>

            </div>

            <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 bg-black/80 backdrop-blur-xl border-t border-yellow-500/10 flex justify-around py-3">

              <button
                onClick={() => setActiveTab("wallet")}
                className={`flex flex-col items-center text-xs transition-all duration-300 ${
                  activeTab === "wallet"
                    ? "text-yellow-400 scale-110 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                    : "text-gray-400"
                }`}
              >
                💰
                <span className="mt-1">Wallet</span>
              </button>

              <button
                onClick={() => setActiveTab("matches")}
                className={`flex flex-col items-center text-xs transition-all duration-300 ${
                  activeTab === "matches"
                    ? "text-red-400 scale-110 drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]"
                    : "text-gray-400"
                }`}
              >
                🎮
                <span className="mt-1">Matches</span>
              </button>

              <button
                onClick={() => setActiveTab("wins")}
                className={`flex flex-col items-center text-xs transition-all duration-300 ${
                  activeTab === "wins"
                    ? "text-yellow-300 scale-110 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                    : "text-gray-400"
                }`}
              >
                🏆
                <span className="mt-1">Wins</span>
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`flex flex-col items-center text-xs transition-all duration-300 ${
                  activeTab === "history"
                    ? "text-blue-400 scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    : "text-gray-400"
                }`}
              >
                📜
                <span className="mt-1">History</span>
              </button>

            </div>
            <div className="sm:hidden">
              {/* Wallet */}
              {activeTab === "wallet" && (
                <div
                  onClick={() =>
                    setShowWalletHistory(true)
                  }
                  className="rounded-[30px] bg-white/5 border border-yellow-500/10 p-4 sm:p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-5">

                    <Wallet className="text-yellow-400 sm:w-10 sm:h-10 w-7 h-7" />

                    <span className="text-green-400 font-bold">
                      HISTORY
                    </span>

                  </div>

                  <h3 className="text-gray-400 text-base mb-2">
                    Wallet Balance
                  </h3>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-yellow-400">
                    ₹{user.wallet || 0}
                  </h1>

                </div>
              )}
              
              {/* Matches */}
              {activeTab === "matches" && (
                <div className="rounded-[30px] bg-white/5 border border-yellow-500/10 p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300">

                  <div className="flex items-center justify-between mb-5">

                    <Swords className="text-red-400 sm:w-10 sm:h-10 w-7 h-7" />

                    <Flame className="text-orange-400 w-6 h-6 animate-pulse" />

                  </div>

                  <h3 className="text-gray-400 text-base mb-2">
                    Matches Played
                  </h3>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                    {user.matches || 0}
                  </h1>

                </div>
              )}

              {/* Wins */}
              {activeTab === "wins" && (
                <div className="rounded-[30px] bg-white/5 border border-yellow-500/10 p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300">

                  <div className="flex items-center justify-between mb-5">

                    <Trophy className="text-yellow-400 sm:w-10 sm:h-10 w-7 h-7" />

                    <Star className="text-yellow-300 w-6 h-6 animate-spin" />

                  </div>

                  <h3 className="text-gray-400 text-base mb-2">
                    Total Wins
                  </h3>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-yellow-400">
                    {user.wins || 0}
                  </h1>

                </div>
              )}

              {/* Match History */}
              {activeTab === "history" && (
                <div className="rounded-[35px] border border-yellow-500/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_0_50px_rgba(255,215,0,0.08)]">

                  <div className="flex items-center justify-between mb-5">

                    <h2 className="sm:text-4xl text-[25px] font-black text-yellow-400">
                      RECENT MATCHES
                    </h2>

                    <Target className="text-red-400 w-6 h-6 " />

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
                            className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-gray-800 hover:border-yellow-500/20 transition-all duration-300"
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
                                className={`font-black text-[17px] ${
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
                        <p className="text-center text-gray-500 text-[10px] mt-5">

                          ⚠ Match history will be automatically removed after 7 days.

                        </p>

                      </>

                    )}

                  </div>

              </div>
              )}
            </div>            
            
            {/* RIGHT */}
            <div className="hidden sm:block lg:col-span-2 space-y-6 sm:space-y-8">

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* Wallet */}
                <div
                  onClick={() =>
                    setShowWalletHistory(true)
                  }
                  className="rounded-[30px] bg-white/5 border border-yellow-500/10 p-4 sm:p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >                
                  <div className="flex items-center justify-between mb-5">

                    <Wallet className="text-yellow-400 sm:w-10 sm:h-10 w-7 h-7" />

                    <span className="text-green-400 font-bold">
                      HISTORY
                    </span>

                  </div>

                  <h3 className="text-gray-400 text-lg mb-2">
                    Wallet Balance
                  </h3>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-yellow-400">
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
            <div className="rounded-[30px] bg-white/5 border border-cyan-500/10 sm:p-6 p-3 backdrop-blur-xl hover:scale-105 transition-all duration-300">

              <div className="flex items-center justify-between sm:mb-5 mb-3">

                <Medal className="text-cyan-400 sm:w-10 sm:h-10 w-5 h-5" />

                <span className="text-cyan-300 sm:font-bold">
                  LEVEL
                </span>

              </div>

              <h3 className="text-gray-400 sm:text-lg text-base mb-2">
                Player Level
              </h3>

              <h1 className="sm:text-5xl text-4xl font-black text-cyan-400 mb-4">
                {level}
              </h1>

              {/* XP BAR */}
              <div className="w-full sm:h-4 h-2 rounded-full bg-black/40 overflow-hidden">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                  style={{
                    width: `${xpPercent}%`
                  }}
                />

              </div>

              <p className="text-gray-500 sm:text-sm text-[10px] mt-2">
                {currentXP}/{nextLevelXP} XP
              </p>

            </div>

            {/* RANK */}
            <div className="rounded-[30px] bg-white/5 border border-yellow-500/10 sm:p-6 p-3 backdrop-blur-xl hover:scale-105 transition-all duration-300">

              <div className="flex items-center justify-between mb-5">

                <Trophy className="text-yellow-400 sm:w-10 sm:h-10 w-5 h-5" />

                <Star className="text-yellow-300 sm:w-6 sm:h-6 w-5 h-5 animate-spin" />

              </div>

              <h3 className="text-gray-400 sm:text-lg text-base mb-2">
                Current Rank
              </h3>

              <h1 className="sm:text-5xl text-3xl font-black text-yellow-400">
                {rank}
              </h1>

              <p className="text-gray-500 mt-3">
                {totalWins} Wins
              </p>

            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-[35px] border border-red-500/20 bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl sm:p-8 p-4 shadow-[0_0_50px_rgba(255,0,0,0.12)]">

              <h2 className="sm:text-3xl text-2xl font-black text-red-400 mb-6">
                QUICK ACTIONS
              </h2>

              <div className="grid grid-cols-2 sm:gap-4 gap-2">

                <button onClick={() => setShowAddCashModal(true)}
                  className="sm:py-4 py-2 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-black font-black hover:scale-105 transition-all">
                  ADD CASH
                </button>

                <button onClick={() => setShowWithdrawModal(true)}
                 className="sm:py-4 py-2 rounded-2xl bg-gradient-to-r from-red-400 to-orange-500 text-black font-black hover:scale-105 transition-all">
                  WITHDRAW
                </button>

                <button
                  onClick={() => setSelectedTab("my")}
                  className={`sm:p-4 p-2 rounded-2xl font-bold ${
                    selectedTab === "my"
                      ? "bg-green-500 text-black"
                      : "bg-white/10"
                  }`}
                >
                  MY MATCHES
                </button>

                <button
                  onClick={() => setSelectedTab("all")}
                  className={`sm:p-4 p-2 rounded-2xl font-bold ${
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

          <div className="sm:mt-8 mt-4 flex gap-4 overflow-x-auto scrollbar-hide pb-2">

            {gameModes.map((mode, index) => (

              <button
                key={index}
                onClick={() => setSelectedMode(mode)}
                className={`
                  sm:px-6 px-3 py-2 sm:py-3 rounded-2xl whitespace-nowrap sm:font-bold  transition-all duration-300
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
          <div className="sm:mt-8 mt-4 rounded-[35px] border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl sm:p-8 p-4 shadow-[0_0_50px_rgba(180,0,255,0.12)]">

            {/* Header */}
            <div className="flex items-center justify-between sm:mb-8 mb-4">

              <h2 className="sm:text-4xl text-2xl font-black text-purple-300">

                {selectedTab === "my"
                  ? "MY TOURNAMENTS"
                  : "ALL TOURNAMENTS"}

              </h2>

              <Trophy className="sm:w-10 sm:h-10 w-5 h-5 text-yellow-400 animate-pulse" />

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
            <div className="grid grid-cols-1 lg:grid-cols-2 sm:gap-6 gap-3">

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
                    className="relative overflow-hidden rounded-3xl border border-purple-500/10 bg-black/30 sm:p-6 p-3 hover:scale-[1.02] transition-all duration-300 hover:border-purple-400/30">

                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 hover:opacity-100 transition-all duration-500" />

                    <div className="relative z-10">

                      {/* Header */}
                      <div className="flex items-center justify-between mb-5">

                        <h3 className="sm:text-3xl text-[20px] font-black text-white">
                          {tournament.title}
                        </h3>

                        <span
                          className={`
                            sm:px-4 sm:py-2 px-2 py-1 rounded-full sm:text-sm text-[10px] font-bold
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
                      <div className="sm:space-y-3 space-y-2 text-gray-300 sm:mb-6 mb-3">

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
                          <span className="ml-2 text-cyan-400 sm:text-[17px] text-[14px] font-bold">

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

                        <div className="sm:mb-6 mb-3">

                          {status === "COMPLETED" ? (

                            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 sm:p-5 p-2 text-center">

                              <p className="text-red-400 font-bold sm:text-lg text-[15px]">
                                Match Completed
                              </p>

                            </div>

                          ) : status === "CANCELLED" ? (

                            <div className="rounded-2xl bg-gray-500/10 border border-gray-500/20 sm:p-5 p-2 text-center">

                              <p className="text-gray-300 font-bold sm:text-lg text-[15px]">
                                Match Cancelled
                              </p>

                            </div>

                          ) :canShowRoom ? (

                            <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-2 sm:p-5">

                              <p className="text-green-400 font-black mb-2 sm:mb-4">
                                ROOM DETAILS UNLOCKED
                              </p>

                              <div className="grid grid-cols-2 sm:gap-4 gap-2">

                                <div className="rounded-2xl bg-black/40 border border-yellow-500/20 sm:p-4 p-2 text-center">

                                  <p className="text-gray-500 sm:text-sm text-[14px] mb-1">
                                    ROOM ID
                                  </p>

                                  <h2 className="sm:text-2xl text-[15px] font-black text-yellow-400 select-text">
                                    {tournament.room_id || "WAIT.."}
                                  </h2>

                                </div>

                                <div className="rounded-2xl bg-black/40 border border-green-500/20 sm:p-4 p-2 text-center">

                                  <p className="text-gray-500 sm:text-sm text-[14px] mb-1">
                                    PASSWORD
                                  </p>

                                  <h2 className="sm:text-2xl text-[15px] font-black text-green-400 select-text">
                                    {tournament.room_password || "WAIT.."}
                                  </h2>

                                </div>

                              </div>

                            </div>

                          ) : (

                            <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/20 sm:p-5 p-2 text-center">

                              <p className="text-yellow-400 font-bold sm:text-lg text-[15px]">

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

                          <span className="sm:px-5 sm:py-2 px-2 py-1 sm:text-[17px] text-[10px]  rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">

                            JOINED ✅

                          </span>

                        ) : (

                          <span
                            className={`sm:px-5 sm:py-2 px-2 py-1 sm:text-[17px] text-[10px]  rounded-full font-bold border
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
                              className="sm:px-6 sm:py-3 px-3 py-1 text-[15px] sm:text-[20px]  rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black hover:scale-105 transition-all duration-300"
                            >

                              VIEW RESULT

                            </button>

                          ) : (

                            <div className="sm:px-6 sm:py-3 px-3 py-1 text-[15px] sm:text-[20px] rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black">

                              MATCH OVER

                            </div>

                          )

                        ) : (

                          <button
                            onClick={() => {

                              setSelectedTournament(tournament);

                              const isSolo =
                                tournament.title
                                  .toLowerCase()
                                  .includes("solo");

                              // SOLO
                              if (isSolo) {

                                setTeamData("");

                              }

                              // TEAM
                              else {

                                setTeamData({
                                  team_name: "",
                                  members: ["", "", "", "", ""]
                                });

                              }

                              setShowModal(true);

                            }}

                            className="sm:px-6 sm:py-3 px-3 py-1 text-[15px] sm:text-[20px] rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black hover:scale-105 transition-all duration-300"
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
          const hasTempResult =
            !!selectedTournament.temp_result_public_id &&
            selectedTournament.leaderboard_preview?.length > 0;
            
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

              <div className="w-full max-w-2xl max-h-[90vh] rounded-[35px] bg-gray-900 border border-purple-500/20 p-4 sm:p-8 relative scrollbar-hide overflow-y-scroll">
              
                {/* CLOSE */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-400"
                >
                  ×
                </button>

                {/* TITLE */}
                <h2 className="sm:text-4xl text-2xl font-black text-purple-300 sm:mb-6 mb-3">

                  {selectedTournament.title}

                </h2>

                {/* PLAYER SLOT SECTION */}
                {!isCompleted && joined && !hasTempResult &&(

                  <div className="sm:mb-6 mb-3 rounded-[30px] border border-green-500/20 bg-gradient-to-br from-green-500/5 to-cyan-500/5 sm:p-6 p-2">

                    {/* HEADER */}
                    <div className="flex items-center justify-between sm:mb-6 mb-3">

                      <h2 className="sm:text-3xl text-[20px] font-black text-green-400">
                        PLAYER SLOTS
                      </h2>

                      <div className="sm:px-4 sm:py-2 px-2 py-1 rounded-2xl bg-black/40 border border-green-500/20 text-green-300 font-bold text-[12px] sm:text-sm">
                        {playersList.length}/{totalSlots} Filled
                      </div>

                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-2 md:grid-cols-4 sm:gap-4 gap-2">

                      {Array.from({ length: totalSlots }, (_, i) => {

                        const slotNumber = i + 1;

                        const player = playersList.find(
                          (p) => p.slot === slotNumber
                        );

                        const hasMembers =
                          player?.members?.length > 0;

                        return (

                          <div
                            key={slotNumber}

                            onClick={() => {

                              // ONLY TEAM MATCH CLICKABLE
                              if (!isSolo && player) {

                                setSelectedPlayer(player);

                              }

                            }}

                            className={`
                              relative overflow-hidden
                              rounded-3xl border sm:p-4 pt-1 transition-all duration-300

                              ${player
                                ? "bg-green-500/10 border-green-500/30 hover:scale-105"
                                : "bg-black/30 border-gray-700"
                              }

                              ${!isSolo && player
                                ? "cursor-pointer hover:border-cyan-400"
                                : "cursor-default"
                              }
                            `}
                          >

                            {/* SLOT NUMBER */}
                            <div className="absolute top-2 right-2 text-xs text-gray-500 font-bold">
                              #{slotNumber}
                            </div>

                            {/* PLAYER */}
                            {player ? (

                              <>

                                {/* ICON */}
                                <div className="sm:w-14 sm:h-14 w-10 h-10 mx-auto rounded-full bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center text-black font-black text-xl mb-3">

                                  {player.team_name
                                    ? "👥"
                                    : "🎮"
                                  }

                                </div>

                                {/* NAME */}
                                <div className="text-center">

                                  <h3 className="text-white font-black sm:text-sm text-[14px] break-words">

                                    {player.team_name || player.name}

                                  </h3>

                                  {/* TEAM INFO */}
                                  {!isSolo && hasMembers && (

                                    <p className="text-cyan-200 sm:text-xs text-[10px] my-1 sm:mt-2">
                                      view members
                                    </p>

                                  )}

                                </div>

                              </>

                            ) : (

                              <div className="sm:py-6 py-3 text-center">

                                <div className="sm:text-3xl text-2xl mb-2 opacity-40">
                                  🎯
                                </div>

                                <p className="text-gray-500 text-sm">
                                  Empty Slot
                                </p>

                              </div>

                            )}

                          </div>

                        );

                      })}

                    </div>

                  </div>
                )}
                                
                {/* TEAM MEMBERS POPUP */}
                {selectedPlayer && !isSolo && (

                  <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center sm:p-4 p-2">

                    <div className="w-full max-w-md rounded-[30px] bg-gray-900 border border-cyan-500/20 sm:p-6 p-2 relative">

                      {/* CLOSE */}
                      <button
                        onClick={() => setSelectedPlayer(null)}
                        className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>

                      {/* TITLE */}
                      <h2 className="sm:text-3xl text-2xl font-black text-cyan-400 sm:mb-6 mb-3 text-center">

                        {selectedPlayer.team_name}

                      </h2>

                      {/* MEMBERS */}
                      <div className="space-y-3">

                        {selectedPlayer.members?.map((member, index) => (

                          <div
                            key={index}
                            className="flex items-center sm:gap-4 gap-6 rounded-2xl bg-black/40 border border-cyan-500/20 sm:p-4 p-3"
                          >

                            <div className="sm:w-10 w-5 sm:h-10 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-black font-black">

                              {index + 1}

                            </div>

                            <div className="text-fuchsia-400 font-bold">
                              {member}
                            </div>

                          </div>

                        ))}

                      </div>

                    </div>

                  </div>

                )}

               {/* RESULT SECTION CLEAN LOGIC */}
                {hasTempResult ? (

                  <div className="mb-4 sm:mb-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-3 sm:p-5">

                    <h2 className="text-xl sm:text-2xl font-black text-yellow-400 mb-4 sm:mb-5">
                      MATCH RESULT
                    </h2>
                    {/* TOP 3 (IMPROVED UI ONLY) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">

                    {/* 🥇 1st PLACE (HERO CARD) */}
                    {selectedTournament.leaderboard_preview[0] && (
                      <div className="relative bg-gradient-to-b from-yellow-400/20 to-yellow-900/10 border border-yellow-400/40 rounded-3xl sm:p-6 p-3 text-center shadow-lg sm:scale-105 overflow-hidden">

                        {/* glow effect */}
                        <div className="absolute inset-0 bg-yellow-400/10 blur-2xl"></div>

                        <div className="relative z-10">

                          <div className="sm:text-5xl text-3xl sm:mb-2 mb-1">🥇</div>

                          <div className="text-white font-black text-lg truncate max-w-[180px] mx-auto">
                            {selectedTournament.leaderboard_preview[0]["Game Name"]}
                          </div>

                          <div className="text-yellow-300 font-bold mt-2">
                            Total: {selectedTournament.leaderboard_preview[0].Total}
                          </div>
                          <div className="text-yellow-300 mt-2">
                          P P : {selectedTournament.leaderboard_preview[0]["Position"]}
                          </div>
                          <div className="text-gray-300 text-sm mt-1">
                            Kills: {selectedTournament.leaderboard_preview[0].Kills}
                          </div>
                          
                          <div className="text-green-400 text-sm mt-1 font-bold">
                            BOOYAH: {selectedTournament.leaderboard_preview[0]["BOOYAH"]}
                          </div>

                        </div>

                      </div>
                    )}

                    {/* 🥈 2nd PLACE */}
                    {selectedTournament.leaderboard_preview[1] && (
                      <div className="bg-gradient-to-b from-gray-400/20 to-gray-900/10 border border-gray-400/30 rounded-3xl sm:p-5 p-2 text-center">

                        <div className="sm:text-4xl text-2xl">🥈</div>

                        <div className="text-white font-bold mt-2 truncate max-w-[180px] mx-auto">
                          {selectedTournament.leaderboard_preview[1]["Game Name"]}
                        </div>

                        <div className="text-gray-300 mt-2">
                          Total: {selectedTournament.leaderboard_preview[1].Total}
                        </div>
                        <div className="text-gray-300 mt-2">
                          P P : {selectedTournament.leaderboard_preview[1]["Position"]}
                          </div>
                        <div className="text-red-400 text-sm mt-1">
                          Kills: {selectedTournament.leaderboard_preview[1].Kills}
                        </div>
                          
                          <div className="text-gray-300 mt-2">
                            BOOYAH: {selectedTournament.leaderboard_preview[1]["BOOYAH"]}
                          </div>

                      </div>
                    )}

                    {/* 🥉 3rd PLACE */}
                    {selectedTournament.leaderboard_preview[2] && (
                      <div className="bg-gradient-to-b from-orange-400/20 to-orange-900/10 border border-orange-400/30 rounded-3xl sm:p-4 p-1 text-center">

                        <div className="sm:text-3xl text-2xl">🥉</div>

                        <div className="text-white font-bold mt-2 truncate max-w-[180px] mx-auto">
                          {selectedTournament.leaderboard_preview[2]["Game Name"]}
                        </div>

                        <div className="text-orange-300 mt-2">
                          Total: {selectedTournament.leaderboard_preview[2].Total}
                          </div>

                          <div className="text-orange-300 mt-2">
                          P P : {selectedTournament.leaderboard_preview[2]["Position"]}
                          </div>

                        <div className="text-red-400 text-sm mt-1">
                          Kills: {selectedTournament.leaderboard_preview[2].Kills}
                        </div>
                          
                          <div className="text-orange-300 mt-2">
                            BOOYAH: {selectedTournament.leaderboard_preview[2]["BOOYAH"]}
                          </div>
                      </div>
                    )}

                  </div>
                    
                    {/* REMAINING PLAYERS */}
                  {selectedTournament.leaderboard_preview.length > 3 && (

                    <div className="rounded-3xl border border-gray-700 bg-black/30 sm:p-4 p-2">

                      <h3 className="text-gray-300 font-bold sm:mb-3 mb-2">
                        Remaining Players
                      </h3>

                      <div className="space-y-2 max-h-72 overflow-y-auto pr-2">

                        {selectedTournament.leaderboard_preview.slice(3).map((p, i) => (

                          <div
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-gray-700 bg-black/20 hover:bg-black/40 transition-all"
                            >

                            {/* LEFT SIDE */}
                            <div className="flex items-center gap-3 text-gray-300">

                              <span className="text-gray-500 font-bold w-8">
                                #{i + 4}
                              </span>

                              <div className="truncate max-w-[180px] mx-auto">
                                {p["Game Name"]}
                              </div>

                            </div>

                            {/* RIGHT SIDE STATS */}
                            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4 text-xs sm:text-sm">

                              <span className="px-2 py-1 rounded-lg bg-red-500/10 text-green-400 font-bold">
                                BOOYAH: {p["BOOYAH"] || 0}
                              </span>
                              <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 font-bold">
                                PP: {p["Position"] || 0}
                              </span>
                              <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 font-bold">
                                Kills: {p["Kills"] || 0}
                              </span>

                              <span className="px-2 py-1 rounded-lg bg-red-500/10 text-yellow-400 font-bold">
                                Total: {p.Total}
                              </span>

                            </div>

                          </div>

                        ))}

                      </div>

                    </div>

                  )}
                </div>
                ) : hasTempResult? (

                  /* =========================
                    CASE 2: NO RESULT (SHOW NOTHING)
                    ========================= */
                  null

                ) : (

                  /* =========================
                    CASE 1: MATCH NOT COMPLETED
                    ========================= */

                  <>
                    {/* INFO */}
                    <div className="space-y-4 text-lg text-gray-300 mb-8">

                      <p>
                        🎟 Entry Fee:
                        <span className="ml-2 text-yellow-400 font-bold">
                          {selectedTournament.entry_fee == 0
                            ? "Free"
                            : "₹ " + selectedTournament.entry_fee}
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
                        <span className="ml-2 text-cyan-400 sm:text-[17px] text-[14px] font-bold">
                          {selectedTournament.match_time
                            ? new Date(selectedTournament.match_time).toLocaleString("en-IN", {
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

                      <ul className="space-y-3 text-gray-300 ">

                        {selectedTournament.rules?.length > 0 ? (
                          selectedTournament.rules.map((rule, index) => (
                            <li className=" 
                              flex items-start gap-2
                              break-words
                              text-sm sm:text-base
                              leading-relaxed"
                              key={index}><span className="text-green-400 mt-0.5">
                                  ✅
                                </span>

                                <span>
                                  {rule}
                                </span>
                            </li>
                          ))
                        ) : (
                          <li>No Rules Added</li>
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
                      <div className="w-full sm:mt-5 mt-3 py-2 sm:py-4 text-[20px] rounded-2xl bg-green-500/10 border border-green-500/20 text-center text-green-400 font-black sm:text-lg">

                        MATCH COMPLETED ✅

                      </div>

                    </div>

                  ) : (

                    <div className="w-full sm:py-4 py-2 rounded-2xl text-[20px] bg-red-500/10 border border-red-500/20 text-center text-red-400 font-black sm:text-lg">

                      MATCH OVER ❌

                    </div>

                  )

                ) : joined ? (

                  <div className="w-full sm:py-4 py-2 rounded-2xl bg-gradient-to-r from-purple-950 to-pink-950 border border-green-500/20 text-center text-cyan-400 font-black text-lg">

                    JOINED ✅

                  </div>

                  ) : canJoin ? (
                    <>
                      <div className="mb-6">

                        <label className="block text-gray-300 mb-3 font-bold text-lg">

                          {isSolo
                            ? "Enter In Game Name"
                            : "Enter Team Details"}

                        </label>

                        {/* SOLO MODE */}
                        {isSolo ? (

                          <input
                            required
                            type="text"
                            value={typeof teamData === "string" ? teamData : ""}
                            onChange={(e) => setTeamData(e.target.value)}
                            placeholder="Enter Your IGN"
                            className="
                              w-full
                              rounded-2xl
                              bg-black/40
                              border border-purple-500/30
                              p-4
                              text-white
                              outline-none
                              focus:border-pink-500
                              transition-all
                            "
                          />

                        ) : (

                          <div className="space-y-5">

                            {/* TEAM NAME */}
                            <div>

                              <p className="text-sm text-gray-400 mb-2">
                                TEAM NAME
                              </p>

                              <input
                                required
                                type="text"
                                value={teamData?.team_name || ""}
                                onChange={(e) =>
                                  setTeamData({
                                    ...teamData,
                                    team_name: e.target.value
                                  })
                                }
                                placeholder="Enter Team Name"
                                className="
                                  w-full
                                  rounded-2xl
                                  bg-black/40
                                  border border-cyan-500/30
                                  p-4
                                  text-white
                                  outline-none
                                  focus:border-cyan-400
                                  transition-all
                                "
                              />

                            </div>

                            {/* MEMBERS SHOW ONLY AFTER TEAM NAME */}
                            {teamData?.team_name?.trim() && (

                              <div className="space-y-3">

                                <p className="text-sm text-gray-400">
                                  TEAM MEMBERS
                                </p>

                                {(teamData?.members || []).map((member, index) => (

                                  <div
                                    key={index}
                                    className="
                                      flex items-center gap-3
                                      bg-black/30
                                      border border-purple-500/20
                                      rounded-2xl
                                      px-4 py-3
                                    "
                                  >

                                    {/* NUMBER */}
                                    <div className="
                                      w-9 h-9
                                      rounded-full
                                      bg-gradient-to-r
                                      from-purple-500
                                      to-pink-500
                                      flex items-center justify-center
                                      text-white font-bold
                                    ">
                                      {index + 1}
                                    </div>

                                    {/* INPUT */}
                                    <input
                                      type="text"
                                      value={member}
                                      onChange={(e) => {

                                        const updatedMembers = [
                                          ...teamData.members
                                        ];

                                        updatedMembers[index] = e.target.value;

                                        setTeamData({
                                          ...teamData,
                                          members: updatedMembers
                                        });

                                      }}
                                      placeholder={`Player ${index + 1} Name`}
                                      className="
                                        flex-1
                                        bg-transparent
                                        outline-none
                                        text-white
                                        placeholder-gray-500
                                      "
                                    />

                                  </div>

                                ))}

                              </div>

                            )}

                          </div>

                        )}

                      </div>
                        
                      <button

                        disabled={

                          joining ||

                          (

                            isSolo

                              ? !teamData?.trim()

                              : !teamData?.team_name?.trim()

                          )

                        }

                        onClick={async () => {

                          if (joining) return;

                          // SOLO VALIDATION
                          if (isSolo) {

                            if (!teamData?.trim()) {

                              errorToast("Enter IGN");

                              return;

                            }

                          }

                          // TEAM VALIDATION
                          else {

                            if (!teamData?.team_name?.trim()) {

                              errorToast("Enter Team Name");

                              return;

                            }

                          }

                          try {

                            setJoining(true);

                            await joinTournament(
                              selectedTournament._id
                            );

                          }

                          finally {

                            setJoining(false);

                          }

                        }}

                        className={`

                          w-full
                          py-4
                          rounded-2xl
                          font-black
                          text-lg
                          transition-all
                          duration-300

                          ${

                            joining

                              ? "bg-gray-700 text-gray-300 cursor-not-allowed"

                              : (

                                  isSolo

                                    ? teamData?.trim()

                                    : teamData?.team_name?.trim()

                                )

                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 text-white"

                                : "bg-gray-600 text-gray-300 cursor-not-allowed"

                          }

                        `}
                      >

                        {joining ? (

                          <div className="flex items-center justify-center gap-3">

                            <div className="
                              w-5 h-5
                              border-2
                              border-white
                              border-t-transparent
                              rounded-full
                              animate-spin
                            " />

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

            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center sm:p-4 p-2">

              <div className="scrollbar-hide overflow-y-auto w-full max-w-md rounded-3xl bg-gray-900 border border-green-500/20 sm:p-8 p-3 max-h-[90vh] relative">

                <button
                  onClick={() => {

                    setShowAddCashModal(false);

                    setShowPaymentSection(false);

                    setAmount("");

                    setScreenshot(null);

                  }}
                  className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-400"
                >
                  ×
                </button>

                <h2 className="sm:text-3xl text-2xl font-black text-green-400 mb-6">

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
                {amount && Number(amount) >= 20 && !showPaymentSection && (

                  <button

                    onClick={() => setShowPaymentSection(true)}

                    className="
                      w-full
                      py-4
                      rounded-2xl
                      font-black
                      text-lg
                      transition-all
                      bg-gradient-to-r
                      from-green-400
                      to-emerald-500
                      text-black
                      hover:scale-105
                      mb-5
                      mt-3
                    "

                  >

                    PROCEED TO PAYMENT

                  </button>

                )}
                {/* SHOW PAYMENT SECTION ONLY AFTER VALID AMOUNT */}
                {showPaymentSection && amount && Number(amount) >= 20 && (
                  <>
                    <div className="flex flex-col items-center mb-5 mt-3">

                      <div className="bg-white p-4 rounded-3xl">

                        <QRCodeCanvas
                          value={`upi://pay?pa=jenishthummar222@oksbi&pn=JK Tournament&am=${amount}&cu=INR`}
                          size={250}
                        />

                      </div>

                      <p className="text-green-400 font-bold mt-4 text-lg">

                        Scan & Pay ₹{amount}

                      </p>

                    </div>

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

                      "CONFIRM PAYMENT"

                    )

                  }

                </button>
                  </>
                  
                )}
                

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
                  placeholder={`Enter Amount (Available ₹${user?.wallet || 0})`}
                  value={withdrawAmount}
                    onChange={(e) => {

                      const value = e.target.value;

                      // BLOCK NEGATIVE
                      if (Number(value) < 1) return;

                      setWithdrawAmount(value);

                    }}
                  className=
                  {`w-full mb-5 rounded-2xl bg-black/40 border border-red-500/20 p-4 text-white outline-none

                    ${
                      withdrawAmount &&
                      Number(withdrawAmount) > Number(user?.wallet || 0)

                        ? "border border-red-500"

                        : "border border-red-500/20"
                    }

                  `}
                />
                {withdrawAmount &&
                  Number(withdrawAmount) > Number(user?.wallet || 0) && (

                    <p className="text-red-400 text-sm mb-4">

                      Insufficient wallet balance

                    </p>

                )}

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

                  disabled={
                    !withdrawAmount ||
                    Number(withdrawAmount) > Number(user?.wallet || 0)
                  }

                  className={`

                    w-full
                    py-4
                    rounded-2xl
                    font-black
                    text-lg
                    transition-all

                    ${
                      !withdrawAmount ||
                      Number(withdrawAmount) > Number(user?.wallet || 0)

                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"

                        : "bg-gradient-to-r from-red-400 to-orange-500 text-black"
                    }

                  `}
                >

                  REQUEST WITHDRAW

                </button>

              </div>

            </div>

          )}

          {/* Show Transaction History */}
          {showWalletHistory && (

            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center sm:p-4 p-2">

              <div className=" scrollbar-hide w-full max-w-3xl rounded-[35px] bg-gray-900 border border-yellow-500/20 sm:p-8 p-3 relative max-h-[90vh] overflow-y-auto">

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
                <h2 className="sm:text-4xl text-2xl font-black text-yellow-400 mb-8">

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
        <section className="sm:px-6 sm:pb-20 px-3 pb-16">

          <div
            className="
            max-w-7xl
            mx-auto
            rounded-[40px]
            border
            border-yellow-500/10
            bg-white/5
            backdrop-blur-xl
            sm:p-10
            p-5
            "
          >

            <h2 className="sm:text-4xl text-2xl font-black text-yellow-400 sm:mb-5 mb-2">

              NEED HELP?

            </h2>

            <p className="text-gray-300 sm:text-lg text-base leading-relaxed sm:mb-8 mb-4">

              Facing payment issues, room problems or tournament errors?
              Contact support anytime.

            </p>

            <div className="flex flex-wrap sm:gap-5 gap-2">

              <a

                href="https://instagram.com/ff.arena.tournaments"

                target="_blank"

                rel="noopener noreferrer"

                className="
                sm:px-8 py-4
                px-6
                rounded-2xl
                bg-gradient-to-r
                from-pink-500
                via-red-500
                to-yellow-500
                text-white
                font-black
                hover:scale-105
                transition-all
                "
              >

                Instagram Support

              </a>
              
            <a
              href="mailto:jk.tournaments99@gmail.com"

              className="
              sm:px-8 py-4
              px-6
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