import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/apiConfig";
import { getAuthToken } from "../lib/auth";
import ClipLoader from "react-spinners/ClipLoader";

interface Player {
  id: string;
  username: string;
  avatarUrl?: string;
  skillLevel?: string;
  isCaptain: boolean;
}

interface MatchGroup {
  sport: string;
  totalPlayers: number;
  minRequired: number;
  readyToPlay: boolean;
  captain: { id: string; username: string };
  players: Player[];
}

const SPORT_EMOJIS: Record<string, string> = {
  Football: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  Volleyball: "🏐",
  Running: "🏃",
  Cycling: "🚴",
  Swimming: "🏊",
  Badminton: "🏸",
};

export default function Matching() {
  const [groups, setGroups] = useState<MatchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getAuthToken();

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/matching/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGroups(data);
      setLoading(false);
    }
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader size={32} color="#4f46e5" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-4 text-center mt-16">
        <p className="text-4xl mb-3">🏃</p>
        <p className="text-lg font-semibold text-slate-700">No matches yet</p>
        <p className="text-sm text-slate-500 mt-1">
          Mark yourself as available today on your profile to get matched!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Today's Matches 🏅</h1>

      {groups.map((group) => (
        <div key={group.sport} className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className={`p-4 flex items-center justify-between ${group.readyToPlay ? "bg-green-500" : "bg-indigo-600"}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{SPORT_EMOJIS[group.sport] || "🏅"}</span>
              <h2 className="text-white font-bold text-lg">{group.sport}</h2>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              group.readyToPlay
                ? "bg-white text-green-600"
                : "bg-white/20 text-white"
            }`}>
              {group.readyToPlay ? "Ready to play!" : `${group.totalPlayers}/${group.minRequired} needed`}
            </span>
          </div>

          {/* Players */}
          <div className="p-4">
            <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wide">
              Players ({group.totalPlayers})
            </p>
            <div className="space-y-2">
              {group.players.map((player) => (
                <div key={player.id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    {player.avatarUrl ? (
                      <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        {player.username[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{player.username}</p>
                    {player.skillLevel && (
                      <p className="text-xs text-slate-400">{player.skillLevel}</p>
                    )}
                  </div>
                  {player.isCaptain && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                      👑 Captain
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}