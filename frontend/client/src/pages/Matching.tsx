import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Zap, MapPin, Calendar, X, Rocket } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Player {
  id: string
  username: string
  avatarUrl?: string
  skillLevel?: string
  isCaptain: boolean
  isConfirmed: boolean
}

interface MatchGroup {
  sport: string
  totalPlayers: number
  minRequired: number
  readyToPlay: boolean
  confirmedCount: number
  currentUserConfirmed: boolean
  captain: { id: string; username: string }
  players: Player[]
}

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

interface Props {
  currentUserId: string
}

export default function Matching({ currentUserId }: Props) {
  const [groups, setGroups] = useState<MatchGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingPlayer, setConfirmingPlayer] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<string | null>(null) // sport name
  const [modalDateTime, setModalDateTime] = useState("")
  const [modalLat, setModalLat] = useState<number | null>(null)
  const [modalLng, setModalLng] = useState<number | null>(null)
  const [modalLocation, setModalLocation] = useState("")
  const [creatingEvent, setCreatingEvent] = useState(false)

  const modalMapRef = useRef<L.Map | null>(null)
  const modalMarkerRef = useRef<L.Marker | null>(null)

  const token = getAuthToken()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/matching/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setGroups(data)
      setLoading(false)
    }
    fetchMatches()
  }, [])

  // Leaflet modal map lifecycle
  useEffect(() => {
    if (!showModal) {
      if (modalMapRef.current) {
        modalMapRef.current.remove()
        modalMapRef.current = null
        modalMarkerRef.current = null
      }
      return
    }

    const timeout = setTimeout(() => {
      if (modalMapRef.current) return
      const map = L.map("modal-match-map").setView([45.7489, 21.2087], 12)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map)

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng
        setModalLat(lat)
        setModalLng(lng)

        const color = SPORT_COLORS[showModal] || "#00e676"
        const emoji = SPORT_EMOJIS[showModal] || "📍"
        const icon = L.divIcon({
          html: `<div style="width:36px;height:36px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 12px ${color}60;border:2px solid rgba(255,255,255,0.3)">${emoji}</div>`,
          className: "",
          iconSize: [36, 36],
        })

        if (modalMarkerRef.current) {
          modalMarkerRef.current.setLatLng([lat, lng])
          modalMarkerRef.current.setIcon(icon)
        } else {
          modalMarkerRef.current = L.marker([lat, lng], { icon }).addTo(map)
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          )
          const data = await res.json()
          if (data.display_name) {
            setModalLocation(data.display_name.split(",").slice(0, 2).join(","))
          }
        } catch { /* ignore */ }
      })

      modalMapRef.current = map
    }, 150)

    return () => clearTimeout(timeout)
  }, [showModal])

  async function handleConfirmPlayer(sport: string) {
    setConfirmingPlayer(sport)
    try {
      await fetch(`${API_BASE_URL}/matching/confirm-player?sport=${encodeURIComponent(sport)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      // Optimistic update
      setGroups(prev => prev.map(g => {
        if (g.sport !== sport) return g
        return {
          ...g,
          currentUserConfirmed: true,
          confirmedCount: g.confirmedCount + 1,
          players: g.players.map(p =>
            p.id === currentUserId ? { ...p, isConfirmed: true } : p
          ),
        }
      }))
    } finally {
      setConfirmingPlayer(null)
    }
  }

  function openCaptainModal(sport: string) {
    setModalDateTime("")
    setModalLat(null)
    setModalLng(null)
    setModalLocation("")
    setShowModal(sport)
  }

  async function handleCreateEvent(group: MatchGroup) {
    if (!modalLat || !modalLng || !modalDateTime) return
    setCreatingEvent(true)
    try {
      const params = new URLSearchParams()
      params.append("sport", group.sport)
      group.players.forEach(p => params.append("playerIds", p.id))
      params.append("captainId", group.captain.id)
      params.append("dateTime", new Date(modalDateTime).toISOString().slice(0, 19))
      params.append("latitude", String(modalLat))
      params.append("longitude", String(modalLng))
      params.append("location", modalLocation || "TBD")

      const res = await fetch(`${API_BASE_URL}/matching/confirm?${params.toString()}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setShowModal(null)
      navigate(`/events/${data.eventId}`)
    } finally {
      setCreatingEvent(false)
    }
  }

  const activeGroup = groups.find(g => g.sport === showModal)

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-black text-4xl tracking-wide text-field-text">
          YOUR <span className="text-field-green">MATCHES</span>
        </h1>
        <p className="text-field-muted text-sm mt-0.5 flex items-center gap-1.5">
          <Zap size={13} className="text-field-green" />
          Stable groups — reshuffled daily
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="glass rounded-2xl h-52 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-5xl mb-4 animate-float">🏃</p>
          <p className="font-display font-bold text-2xl text-field-text tracking-wide">NO MATCHES YET</p>
          <p className="text-field-muted text-sm mt-2">Mark yourself available on your profile to get matched</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {groups.map((group, i) => {
            const color = SPORT_COLORS[group.sport] || "#00e676"
            const readiness = group.totalPlayers / group.minRequired
            const isCaptain = group.captain.id === currentUserId
            const canCreateEvent = isCaptain && group.confirmedCount >= 2

            return (
              <motion.div
                key={group.sport}
                className="glass rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
              >
                {/* Sport Header */}
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${color}20 0%, transparent 100%)`,
                    borderBottom: `1px solid ${color}20`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{SPORT_EMOJIS[group.sport] || "🏅"}</span>
                    <div>
                      <p className="font-display font-black text-xl tracking-wide text-field-text">
                        {group.sport.toUpperCase()}
                      </p>
                      <p className="text-xs text-field-muted">
                        {group.totalPlayers}/{group.minRequired} min · {group.confirmedCount} confirmed
                      </p>
                    </div>
                  </div>
                  {group.readyToPlay ? (
                    <Badge variant="green" className="animate-pulse-ring">
                      <span className="w-1.5 h-1.5 rounded-full bg-field-green" />
                      READY
                    </Badge>
                  ) : (
                    <Badge variant="muted">
                      {group.totalPlayers}/{group.minRequired}
                    </Badge>
                  )}
                </div>

                {/* Readiness bar */}
                <div className="h-0.5 bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(readiness * 100, 100)}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                  />
                </div>

                {/* Players */}
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-field-muted mb-3">
                    Players ({group.totalPlayers})
                  </p>
                  <div className="space-y-2">
                    {group.players.map(player => (
                      <div key={player.id} className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                          style={{ background: `${color}20`, border: `1px solid ${color}30`, color }}
                        >
                          {player.avatarUrl ? (
                            <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            player.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-field-text">{player.username}</p>
                          {player.skillLevel && (
                            <p className="text-xs text-field-muted">{player.skillLevel}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {player.isCaptain && (
                            <Badge variant="amber">
                              <Crown size={10} />
                              Captain
                            </Badge>
                          )}
                          {player.isConfirmed ? (
                            <span className="text-field-green text-xs flex items-center gap-1">
                              <CheckCircle size={13} />
                              In
                            </span>
                          ) : (
                            <span className="text-field-muted text-xs">Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="px-5 pb-5 space-y-2">
                  {/* "I'm In!" button — shown when not yet confirmed */}
                  {!group.currentUserConfirmed ? (
                    <Button
                      onClick={() => handleConfirmPlayer(group.sport)}
                      disabled={confirmingPlayer === group.sport}
                      size="lg"
                      variant="outline"
                      className="w-full font-bold"
                    >
                      {confirmingPlayer === group.sport ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-field-green border-t-transparent rounded-full animate-spin" />
                          Confirming...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span>🙋</span>
                          I&apos;m In!
                        </span>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-field-green border border-field-green/20 bg-field-green/5">
                      <CheckCircle size={15} />
                      You&apos;re in!
                    </div>
                  )}

                  {/* Captain "Create Event" button */}
                  {isCaptain && (
                    <Button
                      onClick={() => openCaptainModal(group.sport)}
                      disabled={!canCreateEvent}
                      size="lg"
                      className="w-full font-bold"
                      title={!canCreateEvent ? `Need at least 2 confirmations (${group.confirmedCount}/2)` : ""}
                    >
                      <span className="flex items-center gap-2">
                        <Rocket size={15} />
                        {canCreateEvent
                          ? "Create Event"
                          : `Create Event (${group.confirmedCount}/2 confirmed)`}
                      </span>
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Captain Create Event Modal */}
      <AnimatePresence>
        {showModal && activeGroup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !creatingEvent && setShowModal(null)}
            />

            {/* Modal */}
            <motion.div
              className="relative glass rounded-2xl w-full max-w-lg overflow-hidden"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Modal header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{
                  background: `linear-gradient(135deg, ${SPORT_COLORS[showModal] || "#00e676"}20 0%, transparent 100%)`,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{SPORT_EMOJIS[showModal] || "🏅"}</span>
                  <div>
                    <p className="font-display font-black text-lg tracking-wide text-field-text">
                      CREATE EVENT
                    </p>
                    <p className="text-xs text-field-muted">{showModal} · {activeGroup.confirmedCount} confirmed players</p>
                  </div>
                </div>
                <button
                  onClick={() => !creatingEvent && setShowModal(null)}
                  className="text-field-muted hover:text-field-text transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Date/Time picker */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-field-muted mb-2">
                    <Calendar size={12} />
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={modalDateTime}
                    onChange={e => setModalDateTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-field-text text-sm focus:outline-none focus:border-field-green/40 [color-scheme:dark]"
                  />
                </div>

                {/* Map */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-field-muted mb-2">
                    <MapPin size={12} />
                    {modalLocation || "Click map to pick location"}
                  </label>
                  <div
                    id="modal-match-map"
                    className="w-full rounded-xl overflow-hidden border border-white/10"
                    style={{ height: "220px" }}
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={() => handleCreateEvent(activeGroup)}
                  disabled={creatingEvent || !modalDateTime || !modalLat || !modalLng}
                  size="lg"
                  className="w-full font-bold"
                >
                  {creatingEvent ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-field-base border-t-transparent rounded-full animate-spin" />
                      Creating event...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Rocket size={15} />
                      Launch Event
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
