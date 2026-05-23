import {

  useEffect,
  useState,
  useRef

} from "react";

import {

  Trophy,
  Users,
  IndianRupee,
  Calendar,
  Trash2,
  Upload,
  Download,
  KeyRound

} from "lucide-react";

import {

  successToast,
  errorToast

} from "../../Utils/showToast";

import { useLocation } from "react-router-dom";


const ManageTournament = () => {

    const [tournaments, setTournaments] = useState([]);

    const [roomData, setRoomData] = useState({});
    
    const [excelFile, setExcelFile] = useState({});

    const [resultImage, setResultImage] = useState({});
    
    const location = useLocation();

    const tournamentRefs = useRef({});
    
    const [uploadProgress, setUploadProgress] = useState({});
  
    const [uploading, setUploading] = useState({});
  
    const queryParams = new URLSearchParams(location.search);

    const selectedTournament = queryParams.get("tournament");
  
  // CANCEL TOURNAMENT
  const cancelTournament = async (id) => {

    if (!window.confirm("Cancel Tournament?")) {

      return;

    }

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/cancel-tournament/${id}`,

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

      fetchTournaments();

    }

    catch {

      errorToast("Cancel Failed");

    }

  };
  
  const formatMatchTime = (time) => {

    if (!time) {

      return "Not Scheduled";

    }

    return new Date(time).toLocaleString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
        hour12: true
      }
    );

  };

  // FETCH TOURNAMENTS
  const fetchTournaments = async () => {

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/tournaments`

      );

      const data = await response.json();

      setTournaments(data);

    }

    catch {

      errorToast("Failed to load tournaments");

    }

  };
  
    
    // ==============================
    // UPLOAD EXCEL RESULT
    // ==============================

    const uploadExcelResult = async (id) => {
      const file = excelFile[id];

      if (!file) {
        errorToast("Select Excel File");
        return;
      }

      try {
        setUploading((prev) => ({ ...prev, [id]: true }));
        setUploadProgress((prev) => ({ ...prev, [id]: 0 }));

        const formData = new FormData();
        formData.append("excel_file", file);

        const xhr = new XMLHttpRequest();

        xhr.open(
          "POST",
          `${import.meta.env.VITE_API_URL}/upload-excel-result/${id}`
        );

        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${localStorage.getItem("token")}`
        );

        // 🔥 PROGRESS TRACKING
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) => ({ ...prev, [id]: percent }));
          }
        };

        xhr.onload = () => {
          setUploading((prev) => ({ ...prev, [id]: false }));

          if (xhr.status === 200) {
            successToast("Excel Uploaded Successfully");
            setUploadProgress((prev) => ({ ...prev, [id]: 100 }));
            fetchTournaments();
          } else {
            errorToast("Excel Upload Failed");
          }
        };

        xhr.onerror = () => {
          setUploading((prev) => ({ ...prev, [id]: false }));
          errorToast("Excel Upload Failed");
        };

        xhr.send(formData);
      } catch {
        setUploading((prev) => ({ ...prev, [id]: false }));
        errorToast("Excel Upload Failed");
      }
    };

    // ==============================
    // UPLOAD RESULT IMAGE
    // ==============================

   const uploadResultImage = async (id) => {
      const file = resultImage[id];

      if (!file) {
        errorToast("Select Result Image");
        return;
      }

      try {
        setUploading((prev) => ({ ...prev, [id]: true }));
        setUploadProgress((prev) => ({ ...prev, [id]: 0 }));

        const formData = new FormData();
        formData.append("result_file", file);

        const xhr = new XMLHttpRequest();

        xhr.open(
          "POST",
          `${import.meta.env.VITE_API_URL}/upload-temp-leaderboard/${id}`
        );

        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${localStorage.getItem("token")}`
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) => ({ ...prev, [id]: percent }));
          }
        };

        xhr.onload = () => {
          setUploading((prev) => ({ ...prev, [id]: false }));

          if (xhr.status === 200) {
            successToast("Image Uploaded Successfully");
            setUploadProgress((prev) => ({ ...prev, [id]: 100 }));
            fetchTournaments();
          } else {
            errorToast("Image Upload Failed");
          }
        };

        xhr.onerror = () => {
          setUploading((prev) => ({ ...prev, [id]: false }));
          errorToast("Image Upload Failed");
        };

        xhr.send(formData);
      } catch {
        setUploading((prev) => ({ ...prev, [id]: false }));
        errorToast("Image Upload Failed");
      }
    };

  useEffect(() => {

    fetchTournaments();

  }, []);

  useEffect(() => {

    if (
      selectedTournament &&
      tournamentRefs.current[selectedTournament]
    ) {

      tournamentRefs.current[
        selectedTournament
      ].scrollIntoView({

        behavior: "smooth",

        block: "center"

      });

    }

  }, [tournaments]);

  // DELETE TOURNAMENT
  const deleteTournament = async (id) => {

    if (!window.confirm("Delete Tournament?")) {

      return;

    }

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/delete-tournament/${id}`,

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

      fetchTournaments();

    }

    catch {

      errorToast("Delete failed");

    }

  };

  // UPDATE ROOM
  const updateRoom = async (id) => {

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/update-room`,

        {

          method: "POST",

          headers: {

            "Content-Type":
            "application/json",

            Authorization:
              `Bearer ${localStorage.getItem("token")}`

          },

          body: JSON.stringify({

            tournament_id: id,

            room_id:
              roomData[id]?.room_id || "",

            room_password:
              roomData[id]?.room_password || ""

          })

        }

      );

      const data = await response.json();

      successToast(data.message);

      fetchTournaments();

    }

    catch {

      errorToast("Room update failed");

    }

  };

  return (

    <div>

      {/* TOP */}
      <div className="mb-6 sm:mb-10">

        <h1 className="text-2xl sm:text-5xl font-black text-yellow-400">

          MANAGE TOURNAMENTS

        </h1>

        <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">

          Control tournaments, rooms and results

        </p>

      </div>
          
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* TOTAL */}
        <div
            className="
            rounded-[30px]
            bg-white/5
            border border-yellow-500/10
            p-6
            backdrop-blur-xl
            "
        >

            <div className="flex items-center justify-between mb-4">

            <Trophy className="text-yellow-400 w-10 h-10" />

            <span className="text-green-400 font-bold">

                LIVE

            </span>

            </div>

            <h3 className="text-gray-400 text-lg mb-2">

            Total Tournaments

            </h3>

            <h1 className="text-5xl font-black text-yellow-400">

            {tournaments.length}

            </h1>

        </div>

        {/* LIVE */}
        <div
            className="
            rounded-[30px]
            bg-white/5
            border border-green-500/10
            p-6
            backdrop-blur-xl
            "
        >

            <div className="flex items-center justify-between mb-4">

            <Users className="text-green-400 w-10 h-10" />

            <span className="text-green-400 font-bold">

                ACTIVE

            </span>

            </div>

            <h3 className="text-gray-400 text-lg mb-2">

            Live Matches

            </h3>

            <h1 className="text-5xl font-black text-green-400">

            {

                tournaments.filter(

                (t) => t.status === "live"

                ).length

            }

            </h1>

        </div>

        {/* COMPLETED */}
        <div
            className="
            rounded-[30px]
            bg-white/5
            border border-red-500/10
            p-6
            backdrop-blur-xl
            "
        >

            <div className="flex items-center justify-between mb-4">

            <Calendar className="text-red-400 w-10 h-10" />

            <span className="text-red-400 font-bold">

                DONE

            </span>

            </div>

            <h3 className="text-gray-400 text-lg mb-2">

            Completed

            </h3>

            <h1 className="text-5xl font-black text-red-400">

            {

                tournaments.filter(

                (t) => t.status === "completed"

                ).length

            }

            </h1>

        </div>

        </div>
          
      {/* LIST */}
      <div className="space-y-8">

        {tournaments.map((tournament) => (

          <div

            key={tournament._id}

            ref={(el) =>

              tournamentRefs.current[
              tournament._id
              ] = el

            }

            className={`
            rounded-[35px]
            ${selectedTournament === tournament._id
                ? "border-2 border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.6)]"
                : "border border-yellow-500/10"
              }
            bg-white/5
            border
            border-yellow-500/10
            p-8
            backdrop-blur-xl
            `}
          >

            {/* TOP */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

              {/* LEFT */}
              <div>

                <div className="flex items-center gap-3 mb-3">

                  <Trophy className="text-yellow-400" />

                  <h2 className="text-3xl font-black text-white">

                    {tournament.title}

                  </h2>

                </div>

                <div className="flex flex-wrap gap-6 text-gray-400">

                  <div className="flex items-center gap-2">

                    <Users size={18} />

                    {tournament.joined_players}/
                    {tournament.players}

                  </div>

                  <div className="flex items-center gap-2">

                    <IndianRupee size={18} />

                    Prize ₹{tournament.prize}

                  </div>

                  <div className="flex items-center gap-2">

                    <Calendar size={18} />

                    {formatMatchTime(tournament.match_time)}

                  </div>

                </div>

              </div>

              {/* STATUS */}
              <div>

                <span
                  className={`
                  px-5 py-2 rounded-2xl font-black
                  ${
                    tournament.status === "live"
                    ? "bg-green-500/20 text-green-400"
                    : tournament.status === "completed"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                  }
                  `}
                >

                  {tournament.status.toUpperCase()}


                </span>

              </div>

            </div>

            {/* ROOM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">

              <input

                type="text"

                placeholder="Room ID"

                defaultValue={tournament.room_id}

                onChange={(e) =>

                  setRoomData({

                    ...roomData,

                    [tournament._id]: {

                      ...roomData[tournament._id],

                      room_id: e.target.value

                    }

                  })

                }

                className="
                rounded-2xl
                bg-black/40
                border
                border-yellow-500/20
                p-4
                outline-none
                "

              />

              <input

                type="text"

                placeholder="Room Password"

                defaultValue={tournament.room_password}

                onChange={(e) =>

                  setRoomData({

                    ...roomData,

                    [tournament._id]: {

                      ...roomData[tournament._id],

                      room_password: e.target.value

                    }

                  })

                }

                className="
                rounded-2xl
                bg-black/40
                border
                border-yellow-500/20
                p-4
                outline-none
                "

              />

            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-8">

              {/* UPDATE ROOM */}
              <button

                onClick={() =>
                  updateRoom(tournament._id)
                }

                className="
                px-6 py-4 rounded-2xl
                bg-yellow-400
                text-black
                font-black
                flex items-center gap-2
                hover:scale-105
                transition-all
                "

              >

                <KeyRound size={20} />

                Update Room

              </button>

              {/* EXPORT */}
              <a
                  href={`${import.meta.env.VITE_API_URL}/export-players/${tournament._id}`}

                  onClick={async (e) => {

                      e.preventDefault();

                      try {

                      const response = await fetch(

                          `${import.meta.env.VITE_API_URL}/export-players/${tournament._id}`,

                          {

                          headers: {

                              Authorization:
                              `Bearer ${localStorage.getItem("token")}`

                          }

                          }

                      );

                      if (!response.ok) {

                          errorToast("Export failed");

                          return;

                      }

                      // DOWNLOAD FILE
                      const blob = await response.blob();

                      const url = window.URL.createObjectURL(blob);

                      const link = document.createElement("a");

                      link.href = url;

                      const matchDate = new Date(tournament.match_time);

                      const formattedDate = matchDate
                        .toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })
                        .replace(",", "")
                        .replace(/\//g, "-")
                        .replace(" ", "_");

                      const safeTitle = tournament.title.replace(/\s+/g, "_");

                      link.download = `${safeTitle}_${formattedDate}.xlsx`;

                      document.body.appendChild(link);

                      link.click();

                      link.remove();

                      successToast("Excel exported");

                      }

                      catch {

                      errorToast("Export failed");

                      }

                  }}

                  className="
                  px-6 py-4 rounded-2xl
                  bg-blue-500/20
                  text-blue-400
                  font-black
                  flex items-center gap-2
                  hover:scale-105
                  transition-all
                  "

                  >

                  <Download size={20} />

                  Export Players

              </a>

              {/* RESULT UPLOAD */}
              <div className="w-full space-y-5">

                {/* FILE SECTIONS */}
                <div className="grid md:grid-cols-2 gap-5">

                  {/* ========================= */}
                  {/* FINAL RESULT (EXCEL) */}
                  {/* ========================= */}

                  <div className="rounded-3xl border border-yellow-500/20 bg-black/40 p-5">

                    <h2 className="text-xl font-black text-yellow-400 mb-4">
                      FINAL RESULT (Money Settlement)
                    </h2>

                    <label className="rounded-2xl border border-yellow-500/20 bg-black/30 p-4 cursor-pointer hover:border-yellow-400 transition-all block">

                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        hidden
                        onChange={(e) =>
                          setExcelFile({
                            ...excelFile,
                            [tournament._id]: e.target.files[0]
                          })
                        }
                      />

                      <div className="text-yellow-400 font-bold mb-2">
                        Upload Final Result (Settlement Excel)
                      </div>

                      <div className="text-gray-400 text-sm break-all">
                        {excelFile[tournament._id]?.name || "No file selected"}
                      </div>

                    </label>

                    <button
                      onClick={() => uploadExcelResult(tournament._id)}
                      className="mt-4 w-full py-4 rounded-2xl bg-yellow-400 text-black font-black"
                    >
                      Publish Final Result
                    </button>

                  </div>

                  {/* ========================= */}
                  {/* RESULT IMAGE */}
                  {/* ========================= */}

                  <div
                    className="
                    rounded-3xl
                    border
                    border-green-500/20
                    bg-black/40
                    p-5
                    "
                  >

                    <h2 className="text-xl font-black text-green-400 mb-4">

                      LIVE LEADERBOARD (Temp Result)

                    </h2>

                    {/* FILE PICKER */}
                    <label
                      className="
                      rounded-2xl
                      border
                      border-green-500/20
                      bg-black/30
                      p-4
                      cursor-pointer
                      hover:border-green-400
                      transition-all
                      block
                      "
                    >

                      <input

                        type="file"

                        accept=".xlsx,.xls"

                        hidden

                        onChange={(e) =>

                          setResultImage({

                            ...resultImage,

                            [tournament._id]:
                            e.target.files[0]

                          })

                        }

                      />

                      <div className="text-green-400 font-bold mb-2">

                         Upload Leaderboard File

                      </div>

                      <div className="text-gray-400 text-sm break-all">

                        {

                          resultImage[tournament._id]?.name ||

                          "No Image Selected"

                        }

                      </div>

                    </label>

                    {/* BUTTON */}
                    <button

                      onClick={() =>

                        uploadResultImage(
                          tournament._id
                        )

                      }

                      className="
                      mt-4
                      w-full
                      py-4
                      rounded-2xl
                      bg-green-500
                      text-black
                      font-black
                      hover:scale-[1.02]
                      transition-all
                      "

                    >

                      Publish Live Leaderboard

                    </button>

                    {uploading[tournament._id] && resultImage[tournament._id] && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-400 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[tournament._id] || 0}%` }}
                          />
                        </div>

                        <p className="text-xs text-gray-300 mt-1">
                          Uploading Image... {uploadProgress[tournament._id] || 0}%
                        </p>
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* CANCEL */}
              <button

                onClick={() =>
                  cancelTournament(tournament._id)
                }

                className="
                px-6 py-4 rounded-2xl
                bg-gray-500/20
                text-gray-300
                font-black
                flex items-center gap-2
                hover:scale-105
                transition-all
                "

              >

                ❌ Cancel

              </button>

              {/* DELETE */}
              <button

                onClick={() =>
                  deleteTournament(tournament._id)
                }

                className="
                px-6 py-4 rounded-2xl
                bg-red-500/20
                text-red-400
                font-black
                flex items-center gap-2
                hover:scale-105
                transition-all
                "

              >

                <Trash2 size={20} />

                Delete

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default ManageTournament;