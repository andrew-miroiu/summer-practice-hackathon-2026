import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { Heart, MessageCircle, Plus, X, ImagePlus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Post {
  postId: string
  text: string
  imageUrl?: string
  videoUrl?: string
  createdAt: string
  userId: string
  username: string
  avatarUrl?: string
  likeCount: number
  commentCount: number
  liked: boolean
}

export default function SocialFeed({ currentUserId }: { currentUserId: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [likingId, setLikingId] = useState<string | null>(null)

  const token = getAuthToken()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setLoading(true)
    const res = await fetch(`${API_BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }

  async function handleCreatePost() {
    if (!content.trim()) return
    setSubmitting(true)
    const formData = new FormData()
    formData.append("content", content)
    if (file) formData.append("file", file)

    await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    setContent("")
    setFile(null)
    setShowCreate(false)
    setSubmitting(false)
    fetchPosts()
  }

  async function handleToggleLike(post: Post, e: React.MouseEvent) {
    e.stopPropagation()
    if (likingId === post.postId) return
    setLikingId(post.postId)

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.postId === post.postId
        ? { ...p, liked: !p.liked, likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1 }
        : p
    ))

    await fetch(`${API_BASE_URL}/likes/toggleLike`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId: post.postId }),
    })

    setLikingId(null)
  }

  function goToPost(post: Post) {
    navigate(`/post/${post.postId}`, { state: { post } })
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-4xl tracking-wide text-field-text">
            SOCIAL <span className="text-field-cyan">FEED</span>
          </h1>
          <p className="text-field-muted text-sm mt-0.5">What&apos;s the community up to?</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="default" variant="cyan">
          <Plus size={15} />
          Post
        </Button>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !submitting && setShowCreate(false)}
            />
            <motion.div
              className="relative glass rounded-2xl w-full max-w-lg overflow-hidden"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
                <p className="font-display font-black text-lg tracking-wide text-field-text">NEW POST</p>
                <button
                  onClick={() => !submitting && setShowCreate(false)}
                  className="text-field-muted hover:text-field-text transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full glass rounded-xl p-3 text-sm text-field-text placeholder:text-field-muted outline-none border border-white/[0.06] focus:border-field-cyan/40 resize-none transition-all"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 px-3 py-2 glass rounded-xl text-xs text-field-muted cursor-pointer hover:text-field-text transition-colors">
                    <ImagePlus size={13} />
                    {file ? file.name.slice(0, 24) : "Add photo"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <Button
                    onClick={handleCreatePost}
                    disabled={submitting || !content.trim()}
                    size="default"
                    variant="cyan"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-field-base border-t-transparent rounded-full animate-spin" />
                        Posting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2"><Send size={13} /> Share</span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl h-48 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <motion.div className="text-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-5xl mb-4">📭</p>
          <p className="font-display font-bold text-2xl text-field-text tracking-wide">NO POSTS YET</p>
          <p className="text-field-muted text-sm mt-2">Be the first to share something!</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <motion.div
              key={post.postId}
              className="glass rounded-2xl overflow-hidden cursor-pointer hover:bg-white/[0.03] transition-all"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => goToPost(post)}
            >
              {/* Author */}
              <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                <div
                  className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.2)", color: "#00e676" }}
                >
                  {post.avatarUrl ? (
                    <img src={post.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    post.username?.[0]?.toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold text-field-text hover:text-field-green transition-colors truncate"
                    onClick={e => { e.stopPropagation(); navigate(`/profile/${post.userId}`) }}
                  >
                    {post.username}
                  </p>
                  <p className="text-xs text-field-muted">
                    {new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Content */}
              {post.text && (
                <p className="px-5 pb-3 text-sm text-field-text leading-relaxed">{post.text}</p>
              )}

              {/* Image */}
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-full h-auto block"
                />
              )}
              {post.videoUrl && (
                <video src={post.videoUrl} controls className="w-full h-auto block" />
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 px-5 py-3 border-t border-white/[0.05]">
                <button
                  onClick={e => handleToggleLike(post, e)}
                  disabled={likingId === post.postId}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                    post.liked ? "text-red-400" : "text-field-muted hover:text-red-400"
                  }`}
                >
                  <Heart size={15} fill={post.liked ? "currentColor" : "none"} />
                  {post.likeCount}
                </button>
                <button
                  className="flex items-center gap-1.5 text-sm font-medium text-field-muted hover:text-field-cyan transition-all"
                  onClick={e => { e.stopPropagation(); goToPost(post) }}
                >
                  <MessageCircle size={15} />
                  {post.commentCount}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
