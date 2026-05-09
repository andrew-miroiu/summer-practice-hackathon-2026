import React from "react";
import PostForm from "../components/PostForm";
import Post from "../components/Post";
import { API_BASE_URL } from "../lib/apiConfig";
//import { useNavigate } from "react-router-dom";
import FeedSkeleton from "../components/skeletons/FeedSkeleton";
import { getAuthToken } from '../lib/auth';



export default function Feed({ currentUserId } : {currentUserId: string;}) {

    const [posts, setPosts] = React.useState<Array<{postId: string; text: string; imageUrl?: string | null; videoUrl?: string | null; userId: string; username: string; likeCount: number; commentCount: number; liked: boolean}>>([]);
    const [loading, setLoading] = React.useState(true);

    const token = getAuthToken();

    React.useEffect(() => {
        // Fetch posts from the backend
        fetch(`${API_BASE_URL}/posts`, {
          headers: {
            Authorization : `Bearer ${token}`,
          },
        })
            .then((res) => res.json())
            .then((data) => { setPosts(data); })
            .finally(() => setLoading(false))
            .catch((err) => console.error("Error fetching posts:", err));
    }, []);

   /* const navigate = useNavigate();

     const openProfile = (userId: string) => {
      navigate(`/profile/${userId}`);
    }; */

    if (loading) {
      return <FeedSkeleton />;
    }

  return (
     <div className="flex justify-center w-full">
    <div className="w-full max-w-xl">
      <PostForm />

      {posts.map((post, index) => (
        <Post 
          key={index}
          postId={post.postId}
          text={post.text}
          imageUrl={post.imageUrl}
          videoUrl={post.videoUrl}
          userId={post.userId}
          username={post.username}
          likeCount={post.likeCount} 
          commentCount={post.commentCount} 
          liked={post.liked} 
          currentUserId={currentUserId}
        />
      ))}

    </div>
  </div>

  )
}
