import { useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, User } from "lucide-react"

export default function Signup({ setLogin }: { setLogin: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, username: fullName } },
    })
    if (!error) setSuccess(true)
    setLoading(false)
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-field-base flex items-center justify-center px-4">
        <motion.div
          className="glass rounded-2xl p-10 text-center max-w-sm w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl mb-4 animate-float">✅</div>
          <h2 className="font-display font-black text-3xl text-field-green tracking-wider mb-2">YOU'RE IN</h2>
          <p className="text-field-muted text-sm mb-6">Check your email to verify your account.</p>
          <Button onClick={() => setLogin(true)} variant="outline" className="w-full">Back to Login</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-field-base flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-field-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-field-green/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-6xl tracking-widest text-field-text">
            JOIN<span className="text-field-cyan">UP</span>
          </h1>
          <p className="text-field-muted text-sm mt-2 font-medium tracking-wider uppercase">
            Create your account
          </p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-5">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Username"
              id="username"
              type="text"
              placeholder="Your username"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              icon={<User size={15} />}
              required
            />
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail size={15} />}
              required
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock size={15} />}
              required
            />

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full font-bold text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-field-base border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-field-muted uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </Button>
        </div>

        <button
          onClick={() => setLogin(true)}
          className="w-full text-center mt-6 text-sm text-field-muted hover:text-field-green transition-colors"
        >
          Already have an account?{" "}
          <span className="text-field-green font-semibold">Sign in</span>
        </button>
      </motion.div>
    </div>
  )
}
