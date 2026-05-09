import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "./lib/supabaseClient"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Navbar from "./components/Navbar"
import Feed from "./pages/Feed"
import Search from "./pages/Search"
import Profile from "./pages/Profile"
import Matching from "./pages/Matching"
import EventDetail from "./pages/EventDetail"
import CreateEvent from "./pages/CreateEvent"
import Messages from "./pages/Messages"
import SocialFeed from "./pages/SocialFeed"
import PostDetail from "./pages/PostDetail"
import type { User } from "@supabase/supabase-js"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"

function AnimatedRoutes({ user, handleLogout }: { user: User; handleLogout: () => void }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Feed />} />
          <Route path="/search" element={<Search currentUserId={user.id} />} />
          <Route path="/profile/:id" element={<Profile key={user.id} currentUser={user.id} />} />
          <Route path="/matching" element={<Matching currentUserId={user.id} />} />
          <Route path="/events/:id" element={<EventDetail currentUserId={user.id} />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/messages" element={<Messages currentUserId={user.id} />} />
          <Route path="/feed/social" element={<SocialFeed currentUserId={user.id} />} />
          <Route path="/post/:id" element={<PostDetail currentUserId={user.id} />} />
          <Route path="/logout" element={<LogoutRedirect handleLogout={handleLogout} />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function LogoutRedirect({ handleLogout }: { handleLogout: () => void }) {
  useEffect(() => { handleLogout() }, [handleLogout])
  return null
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(true)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (window.location.hash.includes("access_token")) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (!error) window.history.replaceState({}, "", window.location.pathname)
      }
    }
    const loadUser = async () => {
      await handleOAuthCallback()
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    loadUser()
  }, [])

  function handleLogout() {
    supabase.auth.signOut().then(() => setUser(null))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-field-base">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-field-green border-t-transparent animate-spin" />
          <p className="font-display text-2xl font-bold text-field-green tracking-widest">SHOWUP2MOVE</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        {showLogin
          ? <Login key="login" setLogin={setShowLogin} />
          : <Signup key="signup" setLogin={setShowLogin} />}
      </AnimatePresence>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-field-base">
        <Navbar handleLogout={handleLogout} userId={user.id} />
        <main className="pt-16 pb-8">
          <AnimatedRoutes user={user} handleLogout={handleLogout} />
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
