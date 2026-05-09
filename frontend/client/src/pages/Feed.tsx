import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Plus, MapPin, Clock, Users, CalendarDays } from "lucide-react"

const SPORT_EMOJIS: Record<string, string> = {
  Football: "⚽", Basketball: "🏀", Tennis: "🎾",
  Volleyball: "🏐", Running: "🏃", Cycling: "🚴",
  Swimming: "🏊", Badminton: "🏸",
}

const SPORT_COLORS: Record<string, string> = {
  Football: "#4ade80", Basketball: "#fb923c", Tennis: "#facc15",
  Volleyball: "#60a5fa", Running: "#f87171", Cycling: "#a78bfa",
  Swimming: "#38bdf8", Badminton: "#34d399",
}

interface EventItem {
  id: string
  sport: string
  location: string
  latitude?: number
  longitude?: number
  dateTime: string
  maxPlayers: number
  currentPlayers: number
  members: { id: string; username: string; avatarUrl?: string; isCaptain: boolean }[]
}

function getTodayStr() { return new Date().toISOString().split("T")[0] }
function getTomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}

export default function Feed() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(getTodayStr())
  const mapRef = useRef<L.Map | null>(null)
  const token = getAuthToken()
  const navigate = useNavigate()

  useEffect(() => { fetchEvents() }, [selectedDate])

  async function fetchEvents() {
    setLoading(true)
    const res = await fetch(`${API_BASE_URL}/events?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setEvents(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    const withLocation = events.filter(e => e.latitude && e.longitude)
    if (withLocation.length === 0) return
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }

    const map = L.map("feed-map").setView([withLocation[0].latitude!, withLocation[0].longitude!], 13)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      maxZoom: 19,
    }).addTo(map)

    withLocation.forEach(event => {
      const color = SPORT_COLORS[event.sport] || "#00e676"
      const icon = L.divIcon({
        html: `<div style="width:36px;height:36px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 12px ${color}60;border:2px solid rgba(255,255,255,0.2)">${SPORT_EMOJIS[event.sport] || "🏅"}</div>`,
        className: "",
        iconSize: [36, 36],
      })
      const marker = L.marker([event.latitude!, event.longitude!], { icon }).addTo(map)
      marker.bindPopup(`
        <div style="background:#071428;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;min-width:160px;font-family:Outfit,sans-serif">
          <div style="font-weight:700;color:#c8d8f0;margin-bottom:4px">${SPORT_EMOJIS[event.sport] || "🏅"} ${event.sport}</div>
          <div style="font-size:11px;color:#4a6080;margin-bottom:8px">${event.location.split(",")[0]}</div>
          <div style="font-size:11px;color:#4a6080">${event.currentPlayers}/${event.maxPlayers} players</div>
          <button onclick="window.location.href='/events/${event.id}'" style="margin-top:8px;padding:5px 12px;background:#00e676;color:#020c1b;border:none;border-radius:8px;cursor:pointer;font-size:11px;font-weight:700;width:100%">View Event</button>
        </div>
      `)
    })

    mapRef.current = map
  }, [events])

  const withLocation = events.filter(e => e.latitude && e.longitude)
  const today = getTodayStr()
  const tomorrow = getTomorrowStr()

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-4xl tracking-wide text-field-text">
            EVENTS <span className="text-field-green">TODAY</span>
          </h1>
          <p className="text-field-muted text-sm mt-0.5">Find your next game</p>
        </div>
        <Button onClick={() => navigate("/events/create")} size="default">
          <Plus size={15} />
          Create
        </Button>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { label: "Today", val: today },
          { label: "Tomorrow", val: tomorrow },
        ].map(({ label, val }) => (
          <button
            key={val}
            onClick={() => setSelectedDate(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedDate === val
                ? "bg-field-green text-field-base shadow-[0_0_12px_rgba(0,230,118,0.3)]"
                : "glass text-field-muted hover:text-field-text"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="flex items-center gap-2 glass rounded-full px-3 py-1">
          <CalendarDays size={14} className="text-field-muted" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm text-field-text outline-none w-32"
          />
        </div>
      </div>

      {/* Map */}
      {withLocation.length > 0 && (
        <motion.div
          className="rounded-2xl overflow-hidden border border-white/[0.06] mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div id="feed-map" style={{ height: 320 }} />
        </motion.div>
      )}

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl h-24 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-5xl mb-4">🏃</p>
          <p className="font-display font-bold text-2xl text-field-text tracking-wide">NO EVENTS</p>
          <p className="text-field-muted text-sm mt-1 mb-6">Be the first to create one</p>
          <Button onClick={() => navigate("/events/create")}>
            <Plus size={15} />
            Create Event
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => {
            const color = SPORT_COLORS[event.sport] || "#00e676"
            const fill = event.currentPlayers / event.maxPlayers
            return (
              <motion.div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="glass rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.05] transition-all duration-200 group"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                {/* Left accent bar */}
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ background: color }}
                />

                {/* Sport icon */}
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  {SPORT_EMOJIS[event.sport] || "🏅"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display font-bold text-lg text-field-text tracking-wide">{event.sport.toUpperCase()}</p>
                    {fill >= 1 && <Badge variant="red">Full</Badge>}
                    {fill >= 0.8 && fill < 1 && <Badge variant="amber">Almost full</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-field-muted">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {event.location.split(",")[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(event.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Players */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <Users size={12} className="text-field-muted" />
                    <span className="font-display font-bold text-xl" style={{ color }}>
                      {event.currentPlayers}
                    </span>
                    <span className="text-field-muted text-sm">/{event.maxPlayers}</span>
                  </div>
                  {/* Capacity bar */}
                  <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(fill * 100, 100)}%`, background: color }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
