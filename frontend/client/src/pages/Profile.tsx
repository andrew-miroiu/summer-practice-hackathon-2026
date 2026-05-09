import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProfileSkeleton from "../components/skeletons/profileSkeleton"
import {
  Camera, Edit3, Save, X, Sparkles, ChevronRight,
  Users, FileText, UserCheck
} from "lucide-react"

interface LoadedUser {
  id: string
  username?: string | null
  avatarUrl?: string
  createdAt: string
  followersCount?: string | null
  followingCount?: string | null
  description?: string
  skillLevel?: string
  availableToday?: boolean
  sportsPreferences?: string[]
}

interface ProfilePost {
  id: string
  text: string
  imageUrl?: string
  videoUrl?: string
  createdAt: string
  updatedAt: string
  userId: string
  username: string
  avatarUrl?: string
}

const SPORTS = ["Football", "Basketball", "Tennis", "Volleyball", "Running", "Cycling", "Swimming", "Badminton"]
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"]
const SPORT_EMOJIS: Record<string, string> = {
  Football: "⚽", Basketball: "🏀", Tennis: "🎾", Volleyball: "🏐",
  Running: "🏃", Cycling: "🚴", Swimming: "🏊", Badminton: "🏸",
}
const SKILL_COLORS: Record<string, string> = {
  Beginner: "muted", Intermediate: "cyan", Advanced: "green",
}

export default function Profile({ currentUser }: { currentUser: string }) {
  const [loadedUser, setLoadedUser] = useState<LoadedUser | null>(null)
  const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [skillLevel, setSkillLevel] = useState("")
  const [description, setDescription] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [availableToday, setAvailableToday] = useState(false)
  const [togglingAvailability, setTogglingAvailability] = useState(false)
  const [detectingSports, setDetectingSports] = useState(false)

  const { id } = useParams()
  const token = getAuthToken()
  const navigate = useNavigate()
  const isOwner = currentUser === id

  async function handleDetectSports() {
    if (!description.trim()) return
    setDetectingSports(true)
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Based on this person's description, identify which sports from this list they might enjoy: Football, Basketball, Tennis, Volleyball, Running, Cycling, Swimming, Badminton. Description: "${description}". Reply ONLY with a JSON array of sport names from the list, nothing else. Example: ["Football", "Running"]`
              }]
            }]
          })
        }
      )
      const data = await res.json()
      const text = data.candidates[0].content.parts[0].text
      const cleaned = text.replace(/```json|```/g, "").trim()
      const detected: string[] = JSON.parse(cleaned)
      const valid = detected.filter((s: string) =>
        SPORTS.includes(s)
      )
      setSelectedSports(prev => [...new Set([...prev, ...valid])])
    } catch {
      /* silently fail */
    }
    setDetectingSports(false)
  }

  useEffect(() => {
    async function loadProfile() {
      if (!id) return
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/profiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLoadedUser(data)
      setSelectedSports(data.sportsPreferences || [])
      setSkillLevel(data.skillLevel || "")
      setDescription(data.description || "")
      setAvailableToday(data.availableToday || false)

      const resPosts = await fetch(`${API_BASE_URL}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dataPosts = await resPosts.json()
      setProfilePosts(dataPosts)
      setLoading(false)
    }
    loadProfile()
  }, [id])

  async function handleAvatarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!avatarFile) return
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("file", avatarFile)
    await fetch(`${API_BASE_URL}/profiles/updateProfile`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    window.location.reload()
    setIsSubmitting(false)
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    const params = new URLSearchParams()
    selectedSports.forEach(s => params.append("sports", s))
    params.append("skillLevel", skillLevel)
    params.append("description", description)
    await fetch(`${API_BASE_URL}/profiles/updateSportsAndSkill?${params.toString()}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    setEditingProfile(false)
    setSavingProfile(false)
    window.location.reload()
  }

  async function handleToggleAvailability() {
    setTogglingAvailability(true)
    const newValue = !availableToday
    await fetch(`${API_BASE_URL}/profiles/availability?available=${newValue}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    setAvailableToday(newValue)
    setTogglingAvailability(false)
  }

  function toggleSport(sport: string) {
    setSelectedSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    )
  }

  if (loading || !loadedUser) return <ProfileSkeleton />

  const initials = loadedUser.username?.[0]?.toUpperCase() || "?"

  return (
    <div className="max-w-xl mx-auto px-4 space-y-4">
      {/* Profile Header Card */}
      <motion.div
        className="glass rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-field-green/20 via-field-cyan/10 to-transparent relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
        </div>

        <div className="px-5 pb-5">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div className="h-20 w-20 rounded-2xl overflow-hidden border-4 border-field-base bg-field-green/10 flex items-center justify-center flex-shrink-0">
              {loadedUser.avatarUrl ? (
                <img src={loadedUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-black text-3xl text-field-green">{initials}</span>
              )}
            </div>
            {availableToday && (
              <Badge variant="green" className="animate-pulse-ring">
                <span className="w-1.5 h-1.5 rounded-full bg-field-green" />
                Available Today
              </Badge>
            )}
          </div>

          <h1 className="font-display font-black text-2xl tracking-wide text-field-text">
            {loadedUser.username || "No Username"}
          </h1>
          {loadedUser.skillLevel && (
            <Badge
              variant={(SKILL_COLORS[loadedUser.skillLevel] as "muted" | "cyan" | "green") || "muted"}
              className="mt-1"
            >
              {loadedUser.skillLevel}
            </Badge>
          )}
          {loadedUser.description && (
            <p className="text-sm text-field-muted mt-2 leading-relaxed">{loadedUser.description}</p>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/[0.06]">
            {[
              { label: "Posts", value: profilePosts.length, icon: FileText },
              { label: "Followers", value: loadedUser.followersCount || 0, icon: Users },
              { label: "Following", value: loadedUser.followingCount || 0, icon: UserCheck },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={14} className="text-field-muted" />
                <div>
                  <p className="font-display font-black text-xl text-field-text leading-none">{value}</p>
                  <p className="text-xs text-field-muted">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sports */}
      {loadedUser.sportsPreferences && loadedUser.sportsPreferences.length > 0 && (
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-field-muted mb-3">Sports</p>
          <div className="flex flex-wrap gap-2">
            {loadedUser.sportsPreferences.map(sport => (
              <span key={sport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-field-green/10 text-field-green border border-field-green/20">
                {SPORT_EMOJIS[sport]} {sport}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Availability toggle - owner only */}
      {isOwner && (
        <motion.div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all ${
            availableToday
              ? "bg-field-green/5 border-field-green/20"
              : "glass border-white/[0.06]"
          }`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div>
            <p className="font-semibold text-field-text text-sm">ShowUp Today? 🏃</p>
            <p className="text-xs text-field-muted mt-0.5">
              {availableToday ? "You're available for matching!" : "Toggle to join today's matchmaking"}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={togglingAvailability}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
              availableToday ? "bg-field-green" : "bg-white/10"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                availableToday ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </motion.div>
      )}

      {/* Edit Profile - owner only */}
      {isOwner && (
        <motion.div
          className="glass rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-all"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-field-text">
              <Edit3 size={15} className="text-field-muted" />
              Edit Profile
            </div>
            <motion.div animate={{ rotate: editingProfile ? 90 : 0 }}>
              <ChevronRight size={16} className="text-field-muted" />
            </motion.div>
          </button>

          <AnimatePresence>
            {editingProfile && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-5 border-t border-white/[0.06] pt-4">
                  {/* Avatar upload */}
                  <form onSubmit={handleAvatarSubmit} className="flex gap-2 items-center">
                    <label className="flex items-center gap-2 px-3 py-2 glass rounded-xl text-xs text-field-muted cursor-pointer hover:text-field-text transition-colors">
                      <Camera size={13} />
                      {avatarFile ? avatarFile.name.slice(0, 20) : "Choose photo"}
                      <input type="file" accept="image/*" className="hidden" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
                    </label>
                    <Button type="submit" size="sm" disabled={isSubmitting || !avatarFile} variant="outline">
                      {isSubmitting ? "..." : "Upload"}
                    </Button>
                  </form>

                  {/* Sports */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-field-muted mb-2">Sports</p>
                    <div className="flex flex-wrap gap-2">
                      {SPORTS.map(sport => (
                        <button
                          key={sport}
                          onClick={() => toggleSport(sport)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedSports.includes(sport)
                              ? "bg-field-green/15 text-field-green border-field-green/30"
                              : "glass text-field-muted border-white/[0.06] hover:text-field-text"
                          }`}
                        >
                          {SPORT_EMOJIS[sport]} {sport}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skill */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-field-muted mb-2">Skill Level</p>
                    <div className="flex gap-2">
                      {SKILL_LEVELS.map(level => (
                        <button
                          key={level}
                          onClick={() => setSkillLevel(level)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            skillLevel === level
                              ? "bg-field-cyan/15 text-field-cyan border-field-cyan/30"
                              : "glass text-field-muted border-white/[0.06] hover:text-field-text"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-field-muted mb-2">About</p>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Tell others about yourself..."
                      className="w-full glass rounded-xl p-3 text-sm text-field-text placeholder:text-field-muted outline-none focus:border-field-green/40 border border-white/[0.06] resize-none transition-all"
                      rows={3}
                    />
                  </div>

                  {/* AI Detect sports */}
                  <Button
                    variant="cyan"
                    size="default"
                    className="w-full"
                    onClick={handleDetectSports}
                    disabled={detectingSports || !description.trim()}
                  >
                    {detectingSports ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-field-cyan border-t-transparent rounded-full animate-spin" />
                        Detecting...
                      </span>
                    ) : (
                      <><Sparkles size={14} /> AI Detect Sports</>
                    )}
                  </Button>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="default" className="flex-1" onClick={() => setEditingProfile(false)}>
                      <X size={14} /> Cancel
                    </Button>
                    <Button size="default" className="flex-1" onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-field-base border-t-transparent rounded-full animate-spin" />
                        </span>
                      ) : (
                        <><Save size={14} /> Save</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Posts grid */}
      {profilePosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-field-muted mb-3 px-1">Posts</p>
          <div className="grid grid-cols-3 gap-1.5">
            {profilePosts.map((post, index) => (
              <div
                key={index}
                onClick={() => navigate(`/post/${post.id}`)}
                className="aspect-[3/4] bg-field-surface rounded-xl overflow-hidden cursor-pointer group relative"
              >
                {post.imageUrl && (
                  <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                )}
                {post.videoUrl && (
                  <video src={post.videoUrl} muted className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
