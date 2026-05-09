import { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { API_BASE_URL } from "../lib/apiConfig"
import { getAuthToken } from "../lib/auth"
import { Heart, MessageCircle, ArrowLeft, Send } from "lucide-react"
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

interface Comment {
  id: string
  postId: string
  userId: string
  username: string
  text: string
  createdAt: string
}

export default function PostDetail({ currentUserId }: { currentUserId: string }) {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const token = getAuthToken()

  // Post data comes from router state (navigated from feed) or fetched as fallback
  const [post, setPost] = useState<Post | null>(location.state?.post ?? null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(post?.liked ?? false)
  const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0)
  const [liking, setLiking] = useState(false)

  // Fallback: fetch all posts and find matching one if not passed via state
  useEffect(() => {
    if (post) return
    async function findPost() {
      const res = await fetch(`${API_BASE_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: Post[] = await res.json()
      const found = data.find(p => p.postId === id)
      if (found) {
        setPost(found)
        setLiked(found.liked)
        setLikeCount(found.likeCount)
      }
    }
    findPost()
  }, [id])

  useEffect(() => {
    if (!id) return
    async function fetchComments() {
      setLoadingComments(true)
      const res = await fetch(`${API_BASE_URL}/comments/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setComments(data)
      setLoadingComments(false)
    }
    fetchComments()
  }, [id])

  async function handleToggleLike() {
    if (liking || !post) return
    setLiking(true)
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)

    await fetch(`${API_BASE_URL}/likes/toggleLike`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId: post.postId }),
    })
    setLiking(false)
  }

  async function handleAddComment() {
    if (!commentText.trim() || !id) return
    setSubmitting(true)

    const res = await fetch(`${API_BASE_URL}/comments/postComment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId: id, text: commentText }),
    })

    if (res.ok) {
      // Re-fetch comments to get username included
      const updated = await fetch(`${API_BASE_URL}/comments/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setComments(await updated.json())
      setCommentText("")
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-field-muted hover:text-field-text transition-colors mb-5 text-sm font-medium"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {!post ? (
        <div className="glass rounded-2xl h-48 animate-pulse" />
      ) : (
        <motion.div
          className="glass rounded-2xl overflow-hidden mb-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Author */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3">
            <div
              className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.2)", color: "#00e676" }}
            >
              {post.avatarUrl ? (
                <img src={post.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                post.username?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <div>
              <p
                className="text-sm font-semibold text-field-text hover:text-field-green cursor-pointer transition-colors"
                onClick={() => navigate(`/profile/${post.userId}`)}
              >
                {post.username}
              </p>
              <p className="text-xs text-field-muted">
                {new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {post.text && (
            <p className="px-5 pb-4 text-sm text-field-text leading-relaxed">{post.text}</p>
          )}

          {post.imageUrl && (
            <img src={post.imageUrl} alt="" className="w-full h-auto block" />
          )}
          {post.videoUrl && (
            <video src={post.videoUrl} controls className="w-full h-auto block" />
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 px-5 py-3 border-t border-white/[0.05]">
            <button
              onClick={handleToggleLike}
              disabled={liking}
              className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                liked ? "text-red-400" : "text-field-muted hover:text-red-400"
              }`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-field-muted">
              <MessageCircle size={16} />
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>
        </motion.div>
      )}

      {/* Comments */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-xs font-semibold uppercase tracking-widest text-field-muted">Comments</p>
        </div>

        {loadingComments ? (
          <div className="space-y-3 p-5">
            {[1, 2].map(i => (
              <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-field-muted text-sm py-8">No comments yet. Be the first!</p>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                className="flex gap-3 px-5 py-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(0,230,118,0.1)", color: "#00e676" }}
                >
                  {comment.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-field-text">{comment.username}</span>
                    <span className="text-xs text-field-muted">
                      {new Date(comment.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-sm text-field-text leading-relaxed">{comment.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <div className="flex gap-2 p-4 border-t border-white/[0.06]">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAddComment()}
            placeholder="Add a comment..."
            className="flex-1 glass rounded-xl px-4 py-2 text-sm text-field-text placeholder:text-field-muted outline-none border border-white/[0.06] focus:border-field-green/40 transition-all"
          />
          <Button
            onClick={handleAddComment}
            disabled={submitting || !commentText.trim()}
            size="default"
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
