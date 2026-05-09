import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MessagesUsers from "../components/MessagesUsers"
import Chat from "../components/Chat"
import { MessageSquare, ArrowLeft } from "lucide-react"

export default function Messages({ currentUserId }: { currentUserId: string }) {
  const [conversation, setConversation] = useState<string>("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [chatHeaderUser, setChatHeaderUser] = useState<string>("")

  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 w-72 flex flex-col
        glass border-r border-white/[0.06] transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-black text-xl tracking-wide text-field-text">MESSAGES</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-field-muted hover:text-field-text hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MessagesUsers
            currentUserId={currentUserId}
            sendConversationId={setConversation}
            onUserSelect={() => setIsSidebarOpen(false)}
            setChatHeaderUser={setChatHeaderUser}
          />
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-field-surface/50">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-field-muted hover:text-field-text hover:bg-white/5 transition-all"
          >
            <MessageSquare size={16} />
          </button>
          <span className="font-semibold text-field-text text-sm">
            {chatHeaderUser || "Select a conversation"}
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <Chat currentUserId={currentUserId} conversation_id={conversation} />
        </div>
      </div>
    </div>
  )
}
