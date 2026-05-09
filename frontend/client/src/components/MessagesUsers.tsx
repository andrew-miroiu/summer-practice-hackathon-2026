import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"

interface LoadedUser {
  id: string
  username?: string | null
  avatarUrl?: string
  createdAt: string
  followersCount?: string | null
  followingCount?: string | null
}

export default function MessagesUsers({
  currentUserId,
  sendConversationId,
  onUserSelect,
  setChatHeaderUser,
}: {
  currentUserId: string
  sendConversationId: React.Dispatch<React.SetStateAction<string>>
  onUserSelect?: () => void
  setChatHeaderUser: React.Dispatch<React.SetStateAction<string>>
}) {
  const [users, setUsers] = useState<LoadedUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const token = getAuthToken()

  useEffect(() => {
    async function getUsers() {
      const res = await fetch(`${API_BASE_URL}/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUsers(data.filter((u: LoadedUser) => u.id !== currentUserId))
    }
    getUsers()
  }, [currentUserId])

  const handleUserClicked = async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ participantId: userId }),
    })
    const data = await res.json()
    setSelectedUserId(userId)
    sendConversationId(data.id)
    onUserSelect?.()
  }

  if (!users.length) {
    return (
      <div className="flex items-center justify-center h-32 text-field-muted text-sm">
        No contacts found
      </div>
    )
  }

  return (
    <div className="p-2">
      {users.map((user, i) => {
        const isSelected = selectedUserId === user.id
        const initial = user.username?.[0]?.toUpperCase() || "?"
        return (
          <motion.button
            key={user.id}
            onClick={() => { handleUserClicked(user.id); setChatHeaderUser(user.username || "") }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              isSelected
                ? "bg-field-green/10 border border-field-green/20"
                : "hover:bg-white/[0.04] border border-transparent"
            }`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden"
              style={isSelected
                ? { background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.3)", color: "#00e676" }
                : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#4a6080" }
              }
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : initial}
            </div>
            <span className={`font-medium text-sm ${isSelected ? "text-field-green" : "text-field-text"}`}>
              {user.username || "(no name)"}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
