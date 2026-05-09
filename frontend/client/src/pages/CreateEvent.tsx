import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { Button } from "@/components/ui/button"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin, Clock, Users, CheckCircle } from "lucide-react"

const SPORTS = [
  { name: "Football", emoji: "⚽", color: "#4ade80" },
  { name: "Basketball", emoji: "🏀", color: "#fb923c" },
  { name: "Tennis", emoji: "🎾", color: "#facc15" },
  { name: "Volleyball", emoji: "🏐", color: "#60a5fa" },
  { name: "Running", emoji: "🏃", color: "#f87171" },
  { name: "Cycling", emoji: "🚴", color: "#a78bfa" },
  { name: "Swimming", emoji: "🏊", color: "#38bdf8" },
  { name: "Badminton", emoji: "🏸", color: "#34d399" },
]

export default function CreateEvent() {
  const [sport, setSport] = useState("")
  const [location, setLocation] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [dateTime, setDateTime] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [submitting, setSubmitting] = useState(false)

  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const token = getAuthToken()
  const navigate = useNavigate()

  useEffect(() => {
    if (mapRef.current) return
    const map = L.map("create-event-map").setView([45.7489, 21.2087], 12)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 19,
    }).addTo(map)

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng
      setLatitude(lat)
      setLongitude(lng)

      const selectedSport = SPORTS.find(s => s.name === sport)
      const color = selectedSport?.color || "#00e676"
      const icon = L.divIcon({
        html: `<div style="width:36px;height:36px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 12px ${color}60;border:2px solid rgba(255,255,255,0.3)">${selectedSport?.emoji || "📍"}</div>`,
        className: "", iconSize: [36, 36],
      })

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
        markerRef.current.setIcon(icon)
      } else {
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
      }

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        const data = await res.json()
        if (data.display_name) setLocation(data.display_name.split(",").slice(0, 2).join(","))
      } catch { /* ignore */ }
    })

    mapRef.current = map
  }, [])

  async function handleSubmit() {
    if (!sport || !dateTime || !latitude || !longitude) return
    setSubmitting(true)
    const params = new URLSearchParams({
      sport, location,
      latitude: String(latitude),
      longitude: String(longitude),
      dateTime,
      maxPlayers: String(maxPlayers),
    })
    const res = await fetch(`${API_BASE_URL}/events?${params.toString()}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    const data = await res.json()
    setSubmitting(false)
    navigate(`/events/${data.id}`)
  }

  const selectedSportObj = SPORTS.find(s => s.name === sport)
  const canSubmit = sport && dateTime && latitude && longitude

  return (
    <div className="max-w-xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="font-display font-black text-4xl tracking-wide text-field-text">
          CREATE <span className="text-field-green">EVENT</span>
        </h1>
        <p className="text-field-muted text-sm mt-0.5">Set up your next game</p>
      </div>

      <div className="space-y-4">
        {/* Sport selection */}
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-field-muted mb-3">Sport</p>
          <div className="grid grid-cols-4 gap-2">
            {SPORTS.map(s => (
              <button
                key={s.name}
                onClick={() => setSport(s.name)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  sport === s.name
                    ? "border-opacity-50 scale-95"
                    : "border-white/[0.06] text-field-muted hover:text-field-text hover:bg-white/[0.04]"
                }`}
                style={sport === s.name ? {
                  background: `${s.color}18`,
                  borderColor: `${s.color}40`,
                  color: s.color,
                } : {}}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Date & Time */}
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-field-muted" />
            <p className="text-xs font-semibold uppercase tracking-widest text-field-muted">Date & Time</p>
          </div>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
            className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-sm text-field-text outline-none focus:border-field-green/40 transition-all"
          />
        </motion.div>

        {/* Max players */}
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-field-muted" />
              <p className="text-xs font-semibold uppercase tracking-widest text-field-muted">Max Players</p>
            </div>
            <span className="font-display font-black text-2xl text-field-green">{maxPlayers}</span>
          </div>
          <input
            type="range" min={2} max={22}
            value={maxPlayers}
            onChange={e => setMaxPlayers(Number(e.target.value))}
            className="w-full accent-field-green"
            style={{ accentColor: selectedSportObj?.color || "#00e676" }}
          />
          <div className="flex justify-between text-xs text-field-muted mt-1">
            <span>2</span><span>22</span>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          className="glass rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-field-muted" />
              <p className="text-xs font-semibold uppercase tracking-widest text-field-muted">Location</p>
            </div>
            {latitude ? (
              <span className="flex items-center gap-1 text-xs text-field-green">
                <CheckCircle size={11} /> Selected
              </span>
            ) : (
              <span className="text-xs text-field-muted">Tap map to select</span>
            )}
          </div>
          {location && (
            <div className="px-5 py-2 border-b border-white/[0.04] flex items-center gap-2">
              <MapPin size={11} className="text-field-green flex-shrink-0" />
              <p className="text-xs text-field-muted truncate">{location}</p>
            </div>
          )}
          <div id="create-event-map" style={{ height: 260 }} />
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            size="xl"
            className="w-full font-bold text-base"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-field-base border-t-transparent rounded-full animate-spin" />
                Creating event...
              </span>
            ) : !canSubmit ? (
              "Fill all fields to continue"
            ) : (
              "Create Event"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
