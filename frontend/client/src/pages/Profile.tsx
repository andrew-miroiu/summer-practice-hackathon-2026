import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/apiConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { useParams, useNavigate } from "react-router-dom";
import ProfileSkeleton from "../components/skeletons/profileSkeleton";
import { getAuthToken } from '../lib/auth';

interface ProfileProps {
  currentUser: string;
}

interface LoadedUser {
  id: string;
  username?: string | null;
  avatarUrl?: string;
  createdAt: string;
  followersCount?: string | null;
  followingCount?: string | null;
  description?: string;
  skillLevel?: string;
  availableToday?: boolean;
  sportsPreferences?: string[];
}

interface ProfilePosts {
  id: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  username: string;
  avatarUrl?: string;
}

const SPORTS = ["Football", "Basketball", "Tennis", "Volleyball", "Running", "Cycling", "Swimming", "Badminton"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function Profile({ currentUser }: ProfileProps) {
  const [loadedUser, setLoadedUser] = useState<LoadedUser | null>(null);
  const [profilePosts, setProfilePosts] = useState<ProfilePosts[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // sports edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [description, setDescription] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [availableToday, setAvailableToday] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const { id } = useParams();
  const token = getAuthToken();
  const navigate = useNavigate();
  const isOwner = currentUser === id;

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/profiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLoadedUser(data);
      setSelectedSports(data.sportsPreferences || []);
      setSkillLevel(data.skillLevel || "");
      setDescription(data.description || "");
      setAvailableToday(data.availableToday || false);

      const resPosts = await fetch(`${API_BASE_URL}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataPosts = await resPosts.json();
      setProfilePosts(dataPosts);
      setLoading(false);
    }
    loadProfile();
  }, [id]);

  async function handleAvatarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!avatarFile) return alert("Choose a file!");
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", avatarFile);
    await fetch(`${API_BASE_URL}/profiles/updateProfile`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    window.location.reload();
    setIsSubmitting(false);
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    const params = new URLSearchParams();
    selectedSports.forEach(s => params.append("sports", s));
    params.append("skillLevel", skillLevel);
    params.append("description", description);

    await fetch(`${API_BASE_URL}/profiles/updateSportsAndSkill?${params.toString()}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setEditingProfile(false);
    setSavingProfile(false);
    window.location.reload();
  }

  async function handleToggleAvailability() {
    setTogglingAvailability(true);
    const newValue = !availableToday;
    await fetch(`${API_BASE_URL}/profiles/availability?available=${newValue}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setAvailableToday(newValue);
    setTogglingAvailability(false);
  }

  function toggleSport(sport: string) {
    setSelectedSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  }

  if (loading || !loadedUser) return <ProfileSkeleton />;

  return (
    <div className="w-full max-w-xl mx-auto p-4 overflow-x-hidden">

      {/* HEADER CARD */}
      <div className="bg-white shadow-md rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            {loadedUser.avatarUrl ? (
              <img src={loadedUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-400 text-sm">No pic</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">{loadedUser.username || "No Username"}</h1>
            {loadedUser.skillLevel && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                {loadedUser.skillLevel}
              </span>
            )}
            {loadedUser.description && (
              <p className="text-sm text-slate-500 mt-1">{loadedUser.description}</p>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="flex justify-around mt-4 text-center border-t pt-4">
          <div>
            <p className="text-lg font-bold text-slate-800">{profilePosts.length}</p>
            <p className="text-xs text-slate-500">Posts</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{loadedUser.followersCount || 0}</p>
            <p className="text-xs text-slate-500">Followers</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{loadedUser.followingCount || 0}</p>
            <p className="text-xs text-slate-500">Following</p>
          </div>
        </div>
      </div>

      {/* SPORTS */}
      {loadedUser.sportsPreferences && loadedUser.sportsPreferences.length > 0 && (
        <div className="bg-white shadow-md rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-slate-700 mb-2">🏅 Sports</p>
          <div className="flex flex-wrap gap-2">
            {loadedUser.sportsPreferences.map(sport => (
              <span key={sport} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                {sport}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SHOWUPTODAY - only owner */}
      {isOwner && (
        <div className={`rounded-2xl p-4 mb-4 shadow-md flex items-center justify-between ${availableToday ? "bg-green-50 border border-green-200" : "bg-white"}`}>
          <div>
            <p className="font-semibold text-slate-800">ShowUpToday? 🏃</p>
            <p className="text-xs text-slate-500">
              {availableToday ? "You're available today!" : "Are you available to play today?"}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={togglingAvailability}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              availableToday
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {togglingAvailability ? <ClipLoader size={14} color="#fff" /> : availableToday ? "✓ Yes!" : "No"}
          </button>
        </div>
      )}

      {/* EDIT PROFILE - only owner */}
      {isOwner && (
        <div className="bg-white shadow-md rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-700">Edit Profile</p>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="text-xs text-indigo-600 font-medium"
            >
              {editingProfile ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* AVATAR FORM */}
          <form onSubmit={handleAvatarSubmit} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              disabled={isSubmitting}
              className="text-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting || !avatarFile}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <ClipLoader size={12} color="#fff" /> : "Update Photo"}
            </button>
          </form>

          {/* SPORTS + SKILL + DESC EDIT */}
          {editingProfile && (
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Sports</p>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map(sport => (
                    <button
                      key={sport}
                      onClick={() => toggleSport(sport)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        selectedSports.includes(sport)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Skill Level</p>
                <div className="flex gap-2">
                  {SKILL_LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => setSkillLevel(level)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        skillLevel === level
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Description</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell others about yourself..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  rows={3}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingProfile ? <ClipLoader size={14} color="#fff" /> : "Save Profile"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* POSTS GRID */}
      <div className="grid grid-cols-3 gap-1 mt-2">
        {profilePosts.map((post, index) => (
          <div
            key={index}
            onClick={() => navigate(`/post/${post.id}`)}
            className="w-full aspect-[3/4] bg-black overflow-hidden rounded-md cursor-pointer"
          >
            {post.imageUrl && (
              <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
            )}
            {post.videoUrl && (
              <video src={post.videoUrl} muted className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}