import { useState } from "react";

import {

  Trophy,
  Calendar,
  Users,
  IndianRupee,
  ShieldCheck

} from "lucide-react";

import {

  successToast,
  errorToast

} from "../../utils/showToast";

const CreateTournament = () => {


  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");

  const [gameMode, setGameMode] = useState("");

  const [entryFee, setEntryFee] = useState("");

  const [prize, setPrize] = useState("");

  const [players, setPlayers] = useState("");

  const [matchTime, setMatchTime] = useState("");

  const [rules, setRules] = useState([]);

  const defaultRules = [

    "No Hacks Allowed",

    "Emulator Not Allowed",

    "Teaming Not Allowed",

    "Only Registered Players Allowed",

    "Match Starts On Time",

    "Use Correct IGN"

  ];

  // CREATE TOURNAMENT
  const createTournament = async () => {

    if (

      !title ||
      !gameMode ||
      !prize ||
      !players ||
      !matchTime

    ) {

      errorToast("Fill all fields");

      return;

    }

    try {

      setLoading(true);

      // =========================
      // FIX DATE FORMAT
      // =========================

      const formattedMatchTime = new Date(

        matchTime

      ).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
        hour12: true
      });

      const response = await fetch(

        "http://127.0.0.1:8000/add-tournament",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

            Authorization:
            `Bearer ${localStorage.getItem("token")}`

          },

          body: JSON.stringify({

            title,

            game_mode: gameMode,

            entry_fee: Number(entryFee),

            prize: Number(prize),

            players: Number(players),

            match_time: formattedMatchTime,

            rules: [

              ...defaultRules,

              ...rules.filter(rule => rule.trim() !== "")

            ]

          })

        }

      );

      const data = await response.json();

      if (data.error) {

        errorToast(data.error);

        return;

      }

      successToast(data.message);

      // RESET

      setTitle("");

      setGameMode("");

      setEntryFee("");

      setPrize("");

      setPlayers("");

      setMatchTime("");

      setRules([""]);

    }

    catch {

      errorToast("Server Error");

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-black text-white p-8 flex justify-center">
        <div className="w-full max-w-5xl">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10">

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">

          <ShieldCheck className="text-black w-8 h-8" />

        </div>

        <div>

          <h1 className="text-5xl font-black text-yellow-400">

            CREATE TOURNAMENT

          </h1>

          <p className="text-gray-500 mt-2">

            Create new esports matches

          </p>

        </div>

      </div>

      {/* FORM */}
      <div className="max-w-4xl rounded-[35px] border border-yellow-500/10 bg-white/5 backdrop-blur-xl p-8 space-y-6">

        {/* TITLE */}
        <div>

          <label className="block mb-3 text-yellow-400 font-bold">

            Tournament Title

          </label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Solo Battle"
            className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 p-4 outline-none"
          />

        </div>

        {/* GAME MODE */}
        <div>

          <label className="block mb-3 text-yellow-400 font-bold">

            Game Mode

          </label>

          <select
            value={gameMode}
            onChange={(e) =>
              setGameMode(e.target.value)
            }
            className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 p-4 outline-none"
          >

            <option value="">
              Select Mode
            </option>

            <option>
              Battle Royale
            </option>

            <option>
              Clash Squad
            </option>
              
            <option>
              Bomb Squad 5v5
              </option>
              
              <option>
                Lone Wolf
              </option>

              <option >
                Solo
              </option>

              <option >
                Duo
              </option>
              

          </select>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ENTRY */}
          <div>

            <label className="block mb-3 text-yellow-400 font-bold">

              Entry Fee

            </label>

            <input
              type="number"
              value={entryFee}
              onChange={(e) =>
                setEntryFee(e.target.value)
              }
              placeholder="50"
              className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 p-4 outline-none"
            />

          </div>

          {/* PRIZE */}
          <div>

            <label className="block mb-3 text-yellow-400 font-bold">

              Prize Pool

            </label>

            <input
              type="number"
              value={prize}
              onChange={(e) =>
                setPrize(e.target.value)
              }
              placeholder="500"
              className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 p-4 outline-none"
            />

          </div>

          {/* PLAYERS */}
          <div>

            <label className="block mb-3 text-yellow-400 font-bold">

              Players

            </label>

            <input
              type="number"
              value={players}
              onChange={(e) =>
                setPlayers(e.target.value)
              }
              placeholder="48"
              className="w-full rounded-2xl bg-black/40 border border-yellow-500/20 p-4 outline-none"
            />

          </div>

        </div>

        {/* MATCH TIME */}
        <div>

          <label className="block mb-3 text-yellow-400 font-bold">

            Match Time

          </label>

          <input
            type="datetime-local"
            min={new Date().toISOString().slice(0,16)}
            value={matchTime}
            onChange={(e) =>
              setMatchTime(e.target.value)
            }
            className="
            w-full
            rounded-2xl
            bg-black/40
            border
            border-yellow-500/20
            p-4
            outline-none
            "
          />

        </div>

        {/* RULES */}
        <div>

          <label className="block mb-4 text-yellow-400 font-bold">

            Tournament Rules

          </label>

          {/* DEFAULT RULES */}
          <div
            className="
            rounded-3xl
            bg-black/30
            border
            border-yellow-500/10
            p-5
            mb-6
            "
          >

            <h3 className="text-lg font-black text-green-400 mb-4">

              Default Rules (Auto Added)

            </h3>

            <div className="space-y-2">

              {

                defaultRules.map((rule, index) => (

                  <div

                    key={index}

                    className="
                    text-gray-300
                    bg-white/5
                    rounded-xl
                    px-4
                    py-3
                    "
                  >

                    ✅ {rule}

                  </div>

                ))

              }

            </div>

          </div>

          {/* CUSTOM RULES */}
          <h3 className="text-lg font-black text-yellow-400 mb-4">

            Extra Rules (Optional)

          </h3>

          <div className="space-y-4">

            {

              rules.map((rule, index) => (

                <div
                  key={index}
                  className="flex gap-3"
                >

                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => {

                      const updatedRules = [...rules];

                      updatedRules[index] =
                        e.target.value;

                      setRules(updatedRules);

                    }}
                    placeholder={`Extra Rule ${index + 1}`}
                    className="
                    w-full
                    rounded-2xl
                    bg-black/40
                    border
                    border-yellow-500/20
                    p-4
                    outline-none
                    "
                  />

                  <button
                    type="button"
                    onClick={() => {

                      setRules(

                        rules.filter(
                          (_, i) => i !== index
                        )

                      );

                    }}
                    className="
                    px-5
                    rounded-2xl
                    bg-red-500
                    text-white
                    font-bold
                    "
                  >

                    X

                  </button>

                </div>

              ))

            }

          </div>

          {/* ADD RULE */}
          <button
            type="button"
            onClick={() =>
              setRules([
                ...rules,
                ""
              ])
            }
            className="
            mt-5
            px-6
            py-3
            rounded-2xl
            bg-yellow-400
            text-black
            font-black
            "
          >

            + Add Extra Rule

          </button>

        </div>

          {/* BUTTON */}
          <button

            onClick={createTournament}

            disabled={loading}

            className="
            w-full
            py-5
            rounded-2xl
            bg-gradient-to-r
            from-yellow-400
            to-orange-500
            text-black
            font-black
            text-xl
            hover:scale-[1.02]
            transition-all
            duration-300
            disabled:opacity-50
            "
          >

            {

              loading
              ? "CREATING..."
              : "CREATE TOURNAMENT"

            }

          </button>

          </div>
        </div>

    </div>

  );

};

export default CreateTournament;