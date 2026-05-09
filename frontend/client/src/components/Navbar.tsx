import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Search, User, Zap, MessageSquare, Plus, Menu, X, LogOut, Newspaper } from "lucide-react"

const NAV_ITEMS = [
  { to: "/", label: "Events 🏅", icon: Home },
  { to: "/feed/social", label: "Social 📱", icon: Newspaper },
  { to: "/matching", label: "Match", icon: Zap },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/search", label: "Search", icon: Search },
]

export default function Navbar({
  userId,
  handleLogout,
}: {
  userId: string
  handleLogout?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-field-base/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 select-none">
            <span className="font-display font-black text-2xl tracking-widest text-field-text">
              SHOWUP<span className="text-field-green">2</span>MOVE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? "bg-field-green/10 text-field-green"
                    : "text-field-muted hover:text-field-text hover:bg-white/5"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
            <Link
              to={`/profile/${userId}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive("/profile")
                  ? "bg-field-green/10 text-field-green"
                  : "text-field-muted hover:text-field-text hover:bg-white/5"
              }`}
            >
              <User size={15} />
              Profile
            </Link>
            <Link
              to="/events/create"
              className="ml-2 flex items-center gap-2 px-4 py-2 bg-field-green text-field-base rounded-xl text-sm font-bold transition-all hover:bg-[#33ffaa] shadow-[0_0_16px_rgba(0,230,118,0.25)]"
            >
              <Plus size={15} />
              Create
            </Link>
            <button
              onClick={handleLogout}
              className="ml-1 h-9 w-9 flex items-center justify-center rounded-xl text-field-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl text-field-muted hover:text-field-text hover:bg-white/5 transition-all"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed top-16 left-0 right-0 z-40 bg-field-surface border-b border-white/[0.06] md:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-1 p-4">
                {NAV_ITEMS.map(({ to, label, icon: Icon }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={to}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(to)
                          ? "bg-field-green/10 text-field-green"
                          : "text-field-text hover:bg-white/5"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <Link
                    to={`/profile/${userId}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive("/profile")
                        ? "bg-field-green/10 text-field-green"
                        : "text-field-text hover:bg-white/5"
                    }`}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                  <Link
                    to="/events/create"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-field-green/10 text-field-green rounded-xl text-sm font-semibold"
                  >
                    <Plus size={16} />
                    Create Event
                  </Link>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <button
                    onClick={() => { setIsOpen(false); handleLogout?.() }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
