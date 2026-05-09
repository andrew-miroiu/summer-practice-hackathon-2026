import { useState, useEffect } from "react";
import { API_BASE_URL } from "../lib/apiConfig";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from '../lib/auth';

interface SearchUser {
  id: string;
  username: string;
  avatar_url?: string | null;
  createdAt: string;
  following: boolean;
}

export default function Search({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [searchedUsername, setSearchedUsername] = useState<string>("");

  const navigate = useNavigate();
  const token = getAuthToken();

  useEffect(() => {
    async function getUsers() {
      const res = await fetch(`${API_BASE_URL}/profiles`,
      {
        headers: {
          Authorization : `Bearer ${token}`,
        },

      });
      const data = await res.json();

      const filtered = data.filter((u: SearchUser) => u.id !== currentUserId);
      setUsers(filtered);
    }
    getUsers();
  }, []);

  const handleFollow = async (followingId: string) => {
    const res = await fetch(`${API_BASE_URL}/follow/${followingId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization : `Bearer ${token}`,
      },
    });

    setUsers(prev =>
      prev.map(user =>
        user.id === followingId ? { ...user, following: true } : user
      )
    );

    console.log(res);
  };

  const handleUnfollow = async (followingId: string) => {
    await fetch(`${API_BASE_URL}/follow/${followingId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization : `Bearer ${token}`,
      },
    });

    setUsers(prev =>
      prev.map(user =>
        user.id === followingId ? { ...user, following: false } : user
      )
    );
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchedUsername.toLowerCase())
  );

  return (
    <div className="search-page w-full max-w-xl mx-auto p-4">

      <h1 className="text-xl font-semibold mb-4">Search</h1>

      <input
        type="text"
        value={searchedUsername}
        onChange={(e) => setSearchedUsername(e.target.value)}
        placeholder="Search by username..."
        className="w-full p-3 rounded-lg border bg-slate-50 text-sm mb-4 focus:ring-2 focus:ring-indigo-400"
      />

      <div className="flex flex-col gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div onClick={() => navigate(`/profile/${user.id}`)}>
              <p className="font-semibold text-slate-800">
                {user.username || "(no name)"}
              </p>
            </div>

            { <button
              onClick={() =>
                user.following ? handleUnfollow(user.id) : handleFollow(user.id)
              }
              className={
                user.following
                  ? "px-4 py-2 rounded-lg bg-slate-200 text-slate-900 text-sm font-medium hover:bg-slate-300 transition"
                  : "px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              }
            >
              {user.following ? "Unfollow" : "Follow"}
            </button> }

          </div>
        ))}
      </div>

    </div>
  );
}
