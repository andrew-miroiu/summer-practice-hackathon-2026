import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../lib/apiConfig";
import { getAuthToken } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";
import ClipLoader from "react-spinners/ClipLoader";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SPORT_EMOJIS: Record<string, string> = {
  Football: "⚽", Basketball: "🏀", Tennis: "🎾",
  Volleyball: "🏐", Running: "🏃", Cycling: "🚴",
  Swimming: "🏊", Badminton: "🏸",
};

interface Member {
  id: string;
  username: string;
  avatarUrl?: string;
  isCaptain: boolean;
}

interface EventData {
  id: string;
  sport: string;
  location: string;
  latitude?: number;
  longitude?: number;
  dateTime: string;
  maxPlayers: number;
  currentPlayers: number;
  createdBy: string;
  members: Member[];
}

interface Message {
  id: string;
  profile_id: string;
  text: string;
  created_at: string;
}

export default function EventDetail({ currentUserId }: { currentUserId: string }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getAuthToken();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const isMember = event?.members.some(m => m.id === currentUserId);
  const isCaptain = event?.members.some(m => m.id === currentUserId && m.isCaptain);

  useEffect(() => {
    fetchEvent();
    fetchMessages();

    const channel = supabase
      .channel(`event-${id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "event_messages",
        filter: `event_id=eq.${id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    if (!event?.latitude || !event?.longitude) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map("event-detail-map").setView([event.latitude, event.longitude], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    L.marker([event.latitude, event.longitude]).addTo(map);
    mapRef.current = map;
  }, [event]);

  async function fetchEvent() {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEvent(data);
    setLoading(false);
  }

  async function fetchMessages() {
    const res = await fetch(`${API_BASE_URL}/events/${id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleJoin() {
    setJoining(true);
    await fetch(`${API_BASE_URL}/events/${id}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setJoining(false);
    fetchEvent();
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    await fetch(`${API_BASE_URL}/events/${id}/messages?text=${encodeURIComponent(newMessage)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNewMessage("");
    setSendingMessage(false);
  }

  if (loading || !event) {
    return <div className="flex justify-center items-center h-64"><ClipLoader size={32} color="#4f46e5" /></div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{SPORT_EMOJIS[event.sport] || "🏅"}</span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{event.sport}</h1>
            <p className="text-sm text-slate-500">{event.location}</p>
            <p className="text-sm text-slate-500">
              {new Date(event.dateTime).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-indigo-600">{event.currentPlayers}</span>/{event.maxPlayers} players
          </p>
          {!isMember && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl font-semibold disabled:opacity-50"
            >
              {joining ? <ClipLoader size={14} color="#fff" /> : "Join Event"}
            </button>
          )}
          {isCaptain && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
              👑 You're the captain
            </span>
          )}
        </div>
      </div>

      {/* MAPA */}
      {event.latitude && event.longitude && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div id="event-detail-map" style={{ height: "220px" }} />
        </div>
      )}

      {/* MEMBRI */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3">Players ({event.currentPlayers})</p>
        <div className="space-y-2">
          {event.members.map(member => (
            <div
              key={member.id}
              onClick={() => navigate(`/profile/${member.id}`)}
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-xl p-1"
            >
              <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    {member.username[0]}
                  </div>
                )}
              </div>
              <p className="flex-1 text-sm font-medium text-slate-800">{member.username}</p>
              {member.isCaptain && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">👑 Captain</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      {isMember && (
        <div className="bg-white rounded-2xl shadow-md p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Group Chat 💬</p>
          <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
            {messages.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No messages yet. Say hi!</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.profile_id === currentUserId ? "flex-row-reverse" : ""}`}>
                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                  msg.profile_id === currentUserId
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleSendMessage}
              disabled={sendingMessage || !newMessage.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {sendingMessage ? <ClipLoader size={14} color="#fff" /> : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}