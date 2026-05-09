import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon, UserPlus, UserMinus } from "lucide-react"

interface SearchUser {
  id: string
  username: string
  avatar_url?: string | null
  createdAt: string
  following: boolean
}

export default function Search({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<SearchUser[]>([])
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const token = getAuthToken()

  useEffect(() => {
    async function getUsers() {
      const res = await fetch(`${API_BASE_URL}/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUsers(data.filter((u: SearchUser) => u.id !== currentUserId))
    }
    getUsers()
  }, [])

  const handleFollow = async (followingId: string) => {
    await fetch(`${API_BASE_URL}/follow/${followingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    setUsers(prev => prev.map(u => u.id === followingId ? { ...u, following: true } : u))
  }

  const handleUnfollow = async (followingId: string) => {
    await fetch(`${API_BASE_URL}/follow/${followingId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    setUsers(prev => prev.map(u => u.id === followingId ? { ...u, following: false } : u))
  }

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="max-w-xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="font-display font-black text-4xl tracking-wide text-field-text">
          FIND <span className="text-field-cyan">PLAYERS</span>
        </h1>
        <p className="text-field-muted text-sm mt-0.5">Discover and connect with athletes</p>
      </div>

      {/* Search input */}
      <div className="relative mb-6">
        <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-field-muted" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by username..."
          className="w-full h-12 glass rounded-2xl pl-11 pr-4 text-sm text-field-text placeholder:text-field-muted outline-none focus:border-field-cyan/40 border border-white/[0.06] transition-all"
        />
      </div>

      {/* Users */}
      <div className="space-y-2">
        {filtered.map((user, i) => (
          <motion.div
            key={user.id}
            className="glass rounded-2xl p-4 flex items-center gap-3 group"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            {/* Avatar */}
            <div
              className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-field-cyan/40 transition-all overflow-hidden bg-field-cyan/10 text-field-cyan border border-field-cyan/20"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                user.username?.[0]?.toUpperCase() || "?"
              )}
            </div>

            <div
              className="flex-1 cursor-pointer"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <p className="font-semibold text-field-text text-sm group-hover:text-field-cyan transition-colors">
                {user.username || "(no name)"}
              </p>
            </div>

            <Button
              variant={user.following ? "outline" : "cyan"}
              size="sm"
              onClick={() => user.following ? handleUnfollow(user.id) : handleFollow(user.id)}
            >
              {user.following ? (
                <><UserMinus size={13} /> Unfollow</>
              ) : (
                <><UserPlus size={13} /> Follow</>
              )}
            </Button>
          </motion.div>
        ))}

        {filtered.length === 0 && query && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-field-muted text-sm">No users found for "{query}"</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
