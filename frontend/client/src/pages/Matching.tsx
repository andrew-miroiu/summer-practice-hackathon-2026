import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Zap } from "lucide-react"

interface Player {
  id: string
  username: string
  avatarUrl?: string
  skillLevel?: string
  isCaptain: boolean
}

interface MatchGroup {
  sport: string
  totalPlayers: number
  minRequired: number
  readyToPlay: boolean
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

export default function Matching() {
  const [groups, setGroups] = useState<MatchGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)
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

  async function handleConfirm(group: MatchGroup) {
    setConfirming(group.sport)
    const params = new URLSearchParams()
    params.append("sport", group.sport)
    group.players.forEach(p => params.append("playerIds", p.id))
    params.append("captainId", group.captain.id)
    const res = await fetch(`${API_BASE_URL}/matching/confirm?${params.toString()}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setConfirming(null)
    navigate(`/events/${data.eventId}`)
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-black text-4xl tracking-wide text-field-text">
          YOUR <span className="text-field-green">MATCHES</span>
        </h1>
        <p className="text-field-muted text-sm mt-0.5 flex items-center gap-1.5">
          <Zap size={13} className="text-field-green" />
          Matched by sport preferences
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
                        {group.totalPlayers}/{group.minRequired} min required
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
                        {player.isCaptain && (
                          <Badge variant="amber">
                            <Crown size={10} />
                            Captain
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm button */}
                <div className="px-5 pb-5">
                  <Button
                    onClick={() => handleConfirm(group)}
                    disabled={confirming === group.sport}
                    size="lg"
                    className="w-full font-bold"
                  >
                    {confirming === group.sport ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-field-base border-t-transparent rounded-full animate-spin" />
                        Creating event...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        Confirm & Create Event
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
