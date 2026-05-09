import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/apiConfig";
import { getAuthToken } from "../lib/auth";
import ClipLoader from "react-spinners/ClipLoader";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SPORTS = ["Football", "Basketball", "Tennis", "Volleyball", "Running", "Cycling", "Swimming", "Badminton"];

export default function CreateEvent() {
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const token = getAuthToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("create-event-map").setView([44.4268, 26.1025], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      setLatitude(lat);
      setLongitude(lng);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        if (data.display_name) {
          setLocation(data.display_name.split(",").slice(0, 2).join(","));
        }
      } catch {}
    });

    mapRef.current = map;
  }, []);

  async function handleSubmit() {
    if (!sport || !dateTime || !latitude || !longitude) {
      alert("Please fill all fields and pick a location on the map!");
      return;
    }
    setSubmitting(true);
    const params = new URLSearchParams({
      sport,
      location,
      latitude: String(latitude),
      longitude: String(longitude),
      dateTime,
      maxPlayers: String(maxPlayers),
    });
    const res = await fetch(`${API_BASE_URL}/events?${params.toString()}`, {
    method: "POST",
    headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    },
    });
    const data = await res.json();
    console.log("Created event:", data);
    setSubmitting(false);
    navigate(`/events/${data.id}`);
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Create Event</h1>

      <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
        <p className="text-sm font-semibold text-slate-700 mb-2">Sport</p>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                sport === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
        <p className="text-sm font-semibold text-slate-700 mb-2">Date & Time</p>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={e => setDateTime(e.target.value)}
          className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
        <p className="text-sm font-semibold text-slate-700 mb-2">Max Players: {maxPlayers}</p>
        <input
          type="range" min={2} max={22}
          value={maxPlayers}
          onChange={e => setMaxPlayers(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
        <p className="text-sm font-semibold text-slate-700 mb-2">
          Pick Location {latitude ? "✓" : "— tap map to select"}
        </p>
        {location && <p className="text-xs text-slate-500 mb-2">{location}</p>}
        <div id="create-event-map" style={{ height: "250px", borderRadius: "12px" }} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? <ClipLoader size={16} color="#fff" /> : "Create Event"}
      </button>
    </div>
  );
}