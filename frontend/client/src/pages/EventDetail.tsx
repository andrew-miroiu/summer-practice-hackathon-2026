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
  profileId: string;  // era profile_id
  text: string;
  createdAt: string;  // era created_at
}

interface Venue {
  name: string;
  address: string;
  description: string;
}

interface ProfileCache {
  username: string;
  avatarUrl?: string;
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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [profilesCache, setProfilesCache] = useState<Record<string, ProfileCache>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const fetchingProfiles = useRef<Set<string>>(new Set());

  const isMember = event?.members.some(m => m.id === currentUserId);
  const isCaptain = event?.members.some(m => m.id === currentUserId && m.isCaptain);

  async function fetchProfileIfNeeded(profileId: string) {
  if (fetchingProfiles.current.has(profileId)) return;
  fetchingProfiles.current.add(profileId);
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/${profileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("Fetched profile for", profileId, data);
    setProfilesCache(prev => ({
      ...prev,
      [profileId]: { username: data.username || "Unknown", avatarUrl: data.avatarUrl }
    }));
  } catch {}
}

  useEffect(() => {
  if (!event || messages.length === 0) return;
  messages.forEach(msg => fetchProfileIfNeeded(msg.profileId));
}, [event, messages]);

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
        const msg = payload.new as Message;
        setMessages(prev => [...prev, msg]);
        fetchProfileIfNeeded(msg.profileId);
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

    fetchNearbyVenues(event.sport);
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
     console.log("First message:", data[0]);
    setMessages(data);
    data.forEach((msg: Message) => fetchProfileIfNeeded(msg.profileId));
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function fetchNearbyVenues(sport: string) {
    const venuesBySport: Record<string, Venue[]> = {
      Football: [
        { name: "Stadionul Dan Păltinișanu", address: "Str. Vasile Pârvan, Timișoara", description: "Principalul stadion de fotbal din Timișoara" },
        { name: "Baza Sportivă Olimpia", address: "Calea Bogdăneștilor, Timișoara", description: "Complex sportiv cu terenuri de fotbal" },
        { name: "Stadionul CFR", address: "Calea Dorobanților, Timișoara", description: "Teren de fotbal în centrul orașului" },
      ],
      Basketball: [
        { name: "Sala Olimpia", address: "Str. Vasile Pârvan 1, Timișoara", description: "Principala sală de baschet din Timișoara" },
        { name: "Universitatea de Vest - Sala Sport", address: "Bd. Vasile Pârvan 4, Timișoara", description: "Sală universitară cu teren de baschet" },
        { name: "Complexul Sportiv Municipal", address: "Aleea Sporturilor 1, Timișoara", description: "Complex cu terenuri de baschet acoperite" },
      ],
      Tennis: [
        { name: "Tenis Club Politehnica", address: "Bd. Vasile Pârvan, Timișoara", description: "Club de tenis cu terenuri exterioare și acoperite" },
        { name: "Strandul Tineretului - Tenis", address: "Aleea Pădurii, Timișoara", description: "Terenuri de tenis lângă strand" },
        { name: "ILSA Tennis Club", address: "Calea Șagului, Timișoara", description: "Club privat de tenis cu instructori" },
      ],
      Volleyball: [
        { name: "Sala Olimpia", address: "Str. Vasile Pârvan 1, Timișoara", description: "Sală polivalentă cu teren de volei" },
        { name: "Liceul Sportiv Banatul", address: "Str. Gheorghe Lazăr, Timișoara", description: "Sală cu terenuri de volei" },
        { name: "Complexul Sportiv Municipal", address: "Aleea Sporturilor 1, Timișoara", description: "Terenuri de volei în aer liber" },
      ],
      Running: [
        { name: "Parcul Rozelor", address: "Aleea Rozelor, Timișoara", description: "Traseu de alergare de 3km în parc" },
        { name: "Parcul Central", address: "Bd. Regele Ferdinand, Timișoara", description: "Traseu popular pentru alergători" },
        { name: "Pădurea Verde", address: "Calea Dorobanților, Timișoara", description: "Trasee naturale de alergare în pădure" },
      ],
      Cycling: [
        { name: "Pista de Ciclism Timișoara", address: "Aleea Sporturilor, Timișoara", description: "Pistă dedicată ciclismului" },
        { name: "Parcul Rozelor - Pista Biciclete", address: "Aleea Rozelor, Timișoara", description: "Traseu pentru biciclete în parc" },
        { name: "Calea Torontalului - Pistă", address: "Calea Torontalului, Timișoara", description: "Pistă de biciclete pe calea principală" },
      ],
      Swimming: [
        { name: "Strandul Tineretului", address: "Aleea Pădurii, Timișoara", description: "Complex acvatic cu bazine olimpice" },
        { name: "Aquapark Timișoara", address: "Calea Torontalului, Timișoara", description: "Parc acvatic cu bazine de înot" },
        { name: "Bazin Olimpic UVT", address: "Bd. Vasile Pârvan 4, Timișoara", description: "Bazin olimpic universitar" },
      ],
      Badminton: [
        { name: "Sala Polivalentă Timișoara", address: "Str. Vasile Pârvan, Timișoara", description: "Sală cu terenuri de badminton" },
        { name: "Badminton Club Timișoara", address: "Calea Șagului, Timișoara", description: "Club dedicat badmintonului" },
        { name: "SportPark Timișoara", address: "Calea Bogdăneștilor, Timișoara", description: "Complex sportiv indoor cu badminton" },
      ],
    };
    setVenues(venuesBySport[sport] || venuesBySport["Football"]);
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

      {/* VENUE SUGGESTIONS */}
      {venues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">📍 Nearby Venues in Timișoara</p>
          <div className="space-y-2">
            {venues.map((venue, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-2xl">🏟️</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{venue.name}</p>
                  <p className="text-xs text-slate-500">{venue.address}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{venue.description}</p>
                </div>
              </div>
            ))}
          </div>
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
            {messages.map((msg, i) => {
              const profile = profilesCache[msg.profileId];
              const isOwn = msg.profileId === currentUserId;
              return (
                <div key={i} className={`flex gap-2 items-end ${isOwn ? "flex-row-reverse" : ""}`}>
                  <div className="h-7 w-7 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        {profile?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                    <p className="text-xs text-slate-400 mb-0.5">
                      {isOwn ? "You" : profile?.username || "..."}
                    </p>
                    <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                      isOwn ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
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