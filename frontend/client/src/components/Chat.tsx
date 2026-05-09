import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../lib/supabaseClient"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { Send, MessageSquare } from "lucide-react"

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export default function Chat({ currentUserId, conversation_id }: { currentUserId: string; conversation_id: string }) {
  const [messageContent, setMessageContent] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const token = getAuthToken()

  useEffect(() => {
    if (!conversation_id) return

    const channel = supabase
      .channel(`conversation-${conversation_id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${conversation_id}`,
      }, (payload) => {
        const n = payload.new
        setMessages(prev => [...prev, {
          id: n.id, conversationId: n.conversation_id,
          senderId: n.sender_id, content: n.content, createdAt: n.created_at,
        }])
      })
      .subscribe()

    const loadMessages = async () => {
      const res = await fetch(`${API_BASE_URL}/messages/conversation/${conversation_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMessages(data)
    }
    loadMessages()

    return () => { supabase.removeChannel(channel) }
  }, [conversation_id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!messageContent.trim()) return
    const msg = messageContent
    setMessageContent("")
    await fetch(`${API_BASE_URL}/messages/conversation/${conversation_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: msg }),
    })
  }

  if (!conversation_id) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-field-muted">
        <div className="h-16 w-16 rounded-2xl glass flex items-center justify-center">
          <MessageSquare size={24} className="text-field-muted" />
        </div>
        <p className="text-sm">Select a conversation to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-field-muted text-sm">
            No messages yet. Say something!
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const isMe = message.senderId === currentUserId
              return (
                <motion.div
                  key={message.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "text-field-base rounded-br-sm"
                          : "bg-white/[0.07] text-field-text rounded-bl-sm border border-white/[0.06]"
                      }`}
                      style={isMe ? { background: "#00e676" } : {}}
                    >
                      {message.content}
                    </div>
                    <p className="text-[10px] text-field-muted px-1">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] p-4 bg-field-surface/30 flex-shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={e => setMessageContent(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend(e)}
            placeholder="Type a message..."
            className="flex-1 h-11 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 text-sm text-field-text placeholder:text-field-muted outline-none focus:border-field-green/30 transition-all"
          />
          <button
            type="submit"
            disabled={!messageContent.trim()}
            className="h-11 w-11 bg-field-green text-field-base rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#33ffaa] transition-all active:scale-95 shadow-[0_0_12px_rgba(0,230,118,0.25)]"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}
