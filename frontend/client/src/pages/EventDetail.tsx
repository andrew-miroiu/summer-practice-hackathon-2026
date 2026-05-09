import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { supabase } from "../lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin, Clock, Users, Crown, Send, MessageSquare, MapIcon } from "lucide-react"

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

interface Member { id: string; username: string; avatarUrl?: string; isCaptain: boolean }

interface EventData {
  id: string; sport: string; location: string; latitude?: number; longitude?: number
  dateTime: string; maxPlayers: number; currentPlayers: number; createdBy: string; members: Member[]
}

interface Message { id: string; profileId: string; text: string; createdAt: string }

interface Venue { name: string; address: string; description: string }

interface ProfileCache { username: string; avatarUrl?: string }

export default function EventDetail({ currentUserId }: { currentUserId: string }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = getAuthToken()

  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [venues, setVenues] = useState<Venue[]>([])
  const [profilesCache, setProfilesCache] = useState<Record<string, ProfileCache>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const fetchingProfiles = useRef<Set<string>>(new Set())

  const isMember = event?.members.some(m => m.id === currentUserId)
  const isCaptain = event?.members.some(m => m.id === currentUserId && m.isCaptain)

  async function fetchProfileIfNeeded(profileId: string) {
    if (fetchingProfiles.current.has(profileId)) return
    fetchingProfiles.current.add(profileId)
    try {
      const res = await fetch(`${API_BASE_URL}/profiles/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProfilesCache(prev => ({
        ...prev,
        [profileId]: { username: data.username || "Unknown", avatarUrl: data.avatarUrl }
      }))
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (!event || messages.length === 0) return
    messages.forEach(msg => fetchProfileIfNeeded(msg.profileId))
  }, [event, messages])

  useEffect(() => {
    fetchEvent()
    fetchMessages()

    const channel = supabase
      .channel(`event-${id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "event_messages",
        filter: `event_id=eq.${id}`,
      }, (payload) => {
        const raw = payload.new
        const msg: Message = {
          id: raw.id as string,
          profileId: raw.profile_id as string,
          text: raw.text as string,
          createdAt: raw.created_at as string,
        }
        setMessages(prev => [...prev, msg])
        fetchProfileIfNeeded(msg.profileId)
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  useEffect(() => {
    if (!event?.latitude || !event?.longitude) return
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }

    const map = L.map("event-detail-map").setView([event.latitude, event.longitude], 15)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 19,
    }).addTo(map)

    const color = SPORT_COLORS[event.sport] || "#00e676"
    const icon = L.divIcon({
      html: `<div style="width:40px;height:40px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 16px ${color}80;border:3px solid rgba(255,255,255,0.3)">${SPORT_EMOJIS[event.sport] || "🏅"}</div>`,
      className: "", iconSize: [40, 40],
    })
    L.marker([event.latitude, event.longitude], { icon }).addTo(map)
    mapRef.current = map

    fetchNearbyVenues(event.sport)
  }, [event])

  async function fetchEvent() {
    setLoading(true)
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setEvent(data)
    setLoading(false)
  }

  async function fetchMessages() {
    const res = await fetch(`${API_BASE_URL}/events/${id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setMessages(data)
    data.forEach((msg: Message) => fetchProfileIfNeeded(msg.profileId))
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  function fetchNearbyVenues(sport: string) {
    const venuesBySport: Record<string, Venue[]> = {
      Football: [
        { name: "Stadionul Dan Păltinișanu", address: "Str. Vasile Pârvan, Timișoara", description: "Principalul stadion de fotbal din Timișoara" },
        { name: "Baza Sportivă Olimpia", address: "Calea Bogdăneștilor, Timișoara", description: "Complex sportiv cu terenuri de fotbal" },
      ],
      Basketball: [
        { name: "Sala Olimpia", address: "Str. Vasile Pârvan 1, Timișoara", description: "Principala sală de baschet din Timișoara" },
        { name: "Universitatea de Vest - Sala Sport", address: "Bd. Vasile Pârvan 4, Timișoara", description: "Sală universitară cu teren de baschet" },
      ],
      Tennis: [
        { name: "Tenis Club Politehnica", address: "Bd. Vasile Pârvan, Timișoara", description: "Club de tenis cu terenuri exterioare și acoperite" },
        { name: "ILSA Tennis Club", address: "Calea Șagului, Timișoara", description: "Club privat de tenis cu instructori" },
      ],
      Volleyball: [
        { name: "Sala Olimpia", address: "Str. Vasile Pârvan 1, Timișoara", description: "Sală polivalentă cu teren de volei" },
        { name: "Complexul Sportiv Municipal", address: "Aleea Sporturilor 1, Timișoara", description: "Terenuri de volei în aer liber" },
      ],
      Running: [
        { name: "Parcul Rozelor", address: "Aleea Rozelor, Timișoara", description: "Traseu de alergare de 3km în parc" },
        { name: "Pădurea Verde", address: "Calea Dorobanților, Timișoara", description: "Trasee naturale de alergare în pădure" },
      ],
      Cycling: [
        { name: "Pista de Ciclism Timișoara", address: "Aleea Sporturilor, Timișoara", description: "Pistă dedicată ciclismului" },
        { name: "Parcul Rozelor - Pista Biciclete", address: "Aleea Rozelor, Timișoara", description: "Traseu pentru biciclete în parc" },
      ],
      Swimming: [
        { name: "Strandul Tineretului", address: "Aleea Pădurii, Timișoara", description: "Complex acvatic cu bazine olimpice" },
        { name: "Bazin Olimpic UVT", address: "Bd. Vasile Pârvan 4, Timișoara", description: "Bazin olimpic universitar" },
      ],
      Badminton: [
        { name: "Sala Polivalentă Timișoara", address: "Str. Vasile Pârvan, Timișoara", description: "Sală cu terenuri de badminton" },
        { name: "Badminton Club Timișoara", address: "Calea Șagului, Timișoara", description: "Club dedicat badmintonului" },
      ],
    }
    setVenues(venuesBySport[sport] || venuesBySport["Football"])
  }

  async function handleJoin() {
    setJoining(true)
    await fetch(`${API_BASE_URL}/events/${id}/join`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    })
    setJoining(false)
    fetchEvent()
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return
    setSendingMessage(true)
    await fetch(`${API_BASE_URL}/events/${id}/messages?text=${encodeURIComponent(newMessage)}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    })
    setNewMessage("")
    setSendingMessage(false)
  }

  if (loading || !event) {
    return (
      <div className="max-w-xl mx-auto px-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-2xl h-32 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    )
  }

  const color = SPORT_COLORS[event.sport] || "#00e676"
  const fill = event.currentPlayers / event.maxPlayers

  return (
    <div className="max-w-xl mx-auto px-4 space-y-4">
      {/* Header */}
      <motion.div
        className="glass rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="px-5 py-6"
          style={{ background: `linear-gradient(135deg, ${color}20 0%, transparent 100%)`, borderBottom: `1px solid ${color}20` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
              {SPORT_EMOJIS[event.sport] || "🏅"}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-black text-3xl tracking-wide text-field-text">
                {event.sport.toUpperCase()}
              </h1>
              <div className="flex flex-col gap-1 mt-1">
                <span className="flex items-center gap-1.5 text-xs text-field-muted">
                  <MapPin size={11} /> {event.location}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-field-muted">
                  <Clock size={11} />
                  {new Date(event.dateTime).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Users size={12} className="text-field-muted" />
                <span className="text-xs text-field-muted">
                  <span className="font-bold text-field-text">{event.currentPlayers}</span>/{event.maxPlayers} players
                </span>
                {fill >= 1 && <Badge variant="red">Full</Badge>}
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(fill * 100, 100)}%` }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
              </div>
            </div>
            {!isMember && (
              <Button onClick={handleJoin} disabled={joining} size="default">
                {joining ? (
                  <span className="w-4 h-4 border-2 border-field-base border-t-transparent rounded-full animate-spin" />
                ) : "Join Event"}
              </Button>
            )}
            {isCaptain && (
              <Badge variant="amber"><Crown size={11} /> Captain</Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Map */}
      {event.latitude && event.longitude && (
        <motion.div
          className="glass rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <MapIcon size={14} className="text-field-muted" />
            <span className="text-xs font-semibold uppercase tracking-widest text-field-muted">Location</span>
          </div>
          <div id="event-detail-map" style={{ height: 220 }} />
        </motion.div>
      )}

      {/* Venue suggestions */}
      {venues.length > 0 && (
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-field-muted mb-3">
            Nearby Venues in Timișoara
          </p>
          <div className="space-y-2">
            {venues.map((venue, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <span className="text-xl">🏟️</span>
                <div>
                  <p className="text-sm font-semibold text-field-text">{venue.name}</p>
                  <p className="text-xs text-field-muted">{venue.address}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Members */}
      <motion.div
        className="glass rounded-2xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-field-muted mb-3">
          Players ({event.currentPlayers})
        </p>
        <div className="space-y-2">
          {event.members.map(member => (
            <div
              key={member.id}
              onClick={() => navigate(`/profile/${member.id}`)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-all group"
            >
              <div
                className="h-9 w-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-sm"
                style={{ background: `${color}18`, border: `1px solid ${color}20`, color }}
              >
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : member.username[0]}
              </div>
              <p className="flex-1 text-sm font-medium text-field-text group-hover:text-field-green transition-colors">
                {member.username}
              </p>
              {member.isCaptain && <Badge variant="amber"><Crown size={10} /> Captain</Badge>}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chat */}
      {isMember && (
        <motion.div
          className="glass rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
            <MessageSquare size={14} className="text-field-muted" />
            <span className="text-xs font-semibold uppercase tracking-widest text-field-muted">Group Chat</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-xs text-field-muted text-center py-6">No messages yet. Say hi!</p>
            )}
            {messages.map((msg, i) => {
              const profile = profilesCache[msg.profileId]
              const isOwn = msg.profileId === currentUserId
              return (
                <div key={i} className={`flex gap-2 items-end ${isOwn ? "flex-row-reverse" : ""}`}>
                  <div
                    className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: `${color}20`, color }}
                  >
                    {profile?.avatarUrl
                      ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : profile?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className={`flex flex-col gap-0.5 max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                    <p className="text-[10px] text-field-muted">
                      {isOwn ? "You" : profile?.username || "..."}
                    </p>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? "text-field-base rounded-br-sm"
                          : "bg-white/[0.06] text-field-text rounded-bl-sm"
                      }`}
                      style={isOwn ? { background: color } : {}}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 p-4 border-t border-white/[0.06]">
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 h-10 glass rounded-xl px-4 text-sm text-field-text placeholder:text-field-muted outline-none focus:border-field-green/30 border border-white/[0.06] transition-all"
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !newMessage.trim()}
              size="icon"
            >
              <Send size={15} />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
