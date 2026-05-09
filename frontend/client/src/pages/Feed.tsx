import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/apiConfig";
import { getAuthToken } from "../lib/auth";
import ClipLoader from "react-spinners/ClipLoader";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SPORT_EMOJIS: Record<string, string> = {
  Football: "⚽", Basketball: "🏀", Tennis: "🎾",
  Volleyball: "🏐", Running: "🏃", Cycling: "🚴",
  Swimming: "🏊", Badminton: "🏸",
};

interface EventItem {
  id: string;
  sport: string;
  location: string;
  latitude?: number;
  longitude?: number;
  dateTime: string;
  maxPlayers: number;
  currentPlayers: number;
  members: { id: string; username: string; avatarUrl?: string; isCaptain: boolean }[];
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function Feed() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const mapRef = useRef<L.Map | null>(null);
  const token = getAuthToken();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  async function fetchEvents() {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/events?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    const eventsWithLocation = events.filter(e => e.latitude && e.longitude);
    if (eventsWithLocation.length === 0) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map("feed-map").setView(
      [eventsWithLocation[0].latitude!, eventsWithLocation[0].longitude!], 13
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    eventsWithLocation.forEach(event => {
      const marker = L.marker([event.latitude!, event.longitude!]).addTo(map);
      marker.bindPopup(`
        <div style="text-align:center">
          <b>${SPORT_EMOJIS[event.sport] || "🏅"} ${event.sport}</b><br/>
          <span style="font-size:12px">${event.location}</span><br/>
          <span style="font-size:12px">${new Date(event.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><br/>
          <span style="font-size:12px">${event.currentPlayers}/${event.maxPlayers} players</span><br/>
          <button onclick="window.location.href='/events/${event.id}'"
            style="margin-top:6px;padding:4px 10px;background:#4f46e5;color:white;border:none;border-radius:8px;cursor:pointer;font-size:12px">
            View Event
          </button>
        </div>
      `);
    });

    mapRef.current = map;
  }, [events]);

  const eventsWithLocation = events.filter(e => e.latitude && e.longitude);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Events 🏅</h1>

      {/* DATE FILTER */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setSelectedDate(getTodayStr())}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            selectedDate === getTodayStr()
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setSelectedDate(getTomorrowStr())}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            selectedDate === getTomorrowStr()
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tomorrow
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* MAPA */}
      {eventsWithLocation.length > 0 && (
        <div className="rounded-2xl overflow-hidden shadow-md mb-6">
          <div id="feed-map" style={{ height: "350px" }} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ClipLoader size={32} color="#4f46e5" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center mt-16">
          <p className="text-4xl mb-3">🏃</p>
          <p className="text-lg font-semibold text-slate-700">No events on this day</p>
          <p className="text-sm text-slate-500 mt-1">Create one or mark yourself available for matching!</p>
          <button
            onClick={() => navigate("/events/create")}
            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl">{SPORT_EMOJIS[event.sport] || "🏅"}</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{event.sport}</p>
                <p className="text-sm text-slate-500">{event.location}</p>
                <p className="text-sm text-slate-500">
                  {new Date(event.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-600">{event.currentPlayers}/{event.maxPlayers}</p>
                <p className="text-xs text-slate-400">players</p>
              </div>
            </div>
          ))}
          <button
            onClick={() => navigate("/events/create")}
            className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-semibold text-sm mt-2"
          >
            + Create Event
          </button>
        </div>
      )}
    </div>
  );
}