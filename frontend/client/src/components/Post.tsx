import {useState} from "react";
import CommentForm from "./CommentForm"
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { API_BASE_URL } from "../lib/apiConfig";
import { useNavigate } from "react-router-dom"; 
import { getAuthToken } from '../lib/auth';


interface Comments {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
  username: string;
}

interface Post {
  postId: string;
  text: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  userId: string;
  username: string;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  currentUserId: string;
}

export default function Post({postId, text, imageUrl, videoUrl, userId, username, likeCount, commentCount, liked, currentUserId} : Post) {
  
  const [numberOfLikes, setNumberOfLikes] = useState<number>(likeCount)
  const [isLiked, setLiked] = useState<boolean>(liked)
  const [openedCommentSection, setOpenedCommentSection] = useState<string>("none")
  const [comments, setComments] = useState<Comments[]>([])
  const [numberOfComments, setNumberOfComments] = useState<number>(commentCount)
  
  const token = getAuthToken();

  //console.log("Post component rendered with props:", {postId, text, imageUrl, videoUrl, userId, username, likeCount, commentCount, liked, currentUserId});
  const handleLike = async () => {
        const res = await fetch(`${API_BASE_URL}/likes/toggleLike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        , Authorization : `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
        })
      });

      const data = await res.json();
      setLiked(data.liked);
      console.log(isLiked);
      setNumberOfLikes(prev => (data.liked ? prev + 1 : prev - 1));
  }

  const fetchComments = async () => {
    const res = await fetch(`${API_BASE_URL}/comments/post/${postId}`,
    {
      headers: {
        Authorization : `Bearer ${token}`,
      },
    }
    )
    const data = await res.json();
    setComments(data)
    console.log("Fetched comments:", data);
    setNumberOfComments(data.length);
  }

  const handleOpeningComments = async () => {

    if(openedCommentSection === "none"){
      setOpenedCommentSection("block")
      await fetchComments();
      console.log(currentUserId + 1);
    }
    else{
      setOpenedCommentSection("none")
    }
  }

  const navigate = useNavigate();

  const openProfile = () => {
    navigate(`/profile/${userId}`);
  };
  
  return (
    <div className="post bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6 w-full">
      
      <div className="post-header mb-4">
        

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Post media"
            className="post-image w-full max-h-[70vh] object-contain bg-black rounded-lg mt-3"
          />
        )}

        {videoUrl && (
          <video controls className="post-video w-full max-h-[70vh] object-contain bg-black rounded-lg mt-3">
            <source src={videoUrl} />
          </video>
        )}

        <h3
          onClick={openProfile}
          className="post-author font-semibold text-sm sm:text-base text-indigo-600 cursor-pointer mt-1.5"
        >
          {username}
        </h3>
        <span className="post-content text-slate-800 text-sm sm:text-base mt-1.5">{text}</span>
      </div>

      <div className="post-actions mt-4 pt-3 border-t border-slate-200 w-full">
        
        <div className="post-stats post-stats flex items-center gap-4 text-sm text-slate-700 mb-3">
          <button
              onClick={handleLike}
              className="flex items-center gap-1 text-red-500 hover:scale-110 transition-transform"
            >
              {isLiked ? (
                <AiFillHeart/>
              ) : (
                <AiOutlineHeart/>
              )}
              <span className="text-slate-700">{numberOfLikes}</span>
            </button>
          <button onClick={handleOpeningComments} className="post-comment-count">💬 {numberOfComments}</button>
        </div>

        <div className={`post-comments mt-4 ${openedCommentSection === "none" ? "hidden" : "block"}`}>
          
          <CommentForm 
            post_id={postId}
            refreshComments={fetchComments}
          />

          <div className="mt-3 space-y-2">
            {comments.map((comment) => (
              <p key={comment.id} className="post-comment text-sm text-slate-800">
                <span className="font-medium">{ comment.username }:</span> {comment.text}
              </p>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}