import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/apiConfig";
import { getAuthToken } from '../lib/auth';

interface LoadedUser {
  id: string;
  username?: string | null;
  avatarUrl?: string;
  createdAt: string;
  followersCount?: string | null;
  followingCount?: string | null;
}

export default function MessagesUsers({
    currentUserId, 
    sendConversationId,
    onUserSelect,
    setChatHeaderUser
} : {
    currentUserId:string; 
    sendConversationId: React.Dispatch<React.SetStateAction<string>>;
    onUserSelect?: () => void;
    setChatHeaderUser: React.Dispatch<React.SetStateAction<string>>;
}) {
    const [users, setUsers] = useState<LoadedUser[]>([])
    const [conversation, setConversation] = useState<string>("")
    const [selectedUserId, setSelectedUserId] = useState<string>("")

    const token = getAuthToken();

    useEffect(()=>{
        async function getUsers() {
            const res = await fetch(`${API_BASE_URL}/profiles`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();
            const filtered = data.filter((u: LoadedUser) => u.id !== currentUserId);
            setUsers(filtered);
            console.log("Loaded users for messaging:", filtered);
        }
        getUsers();
    }, [currentUserId])

    const handleMessagesUserClicked = async (userId :string) => {
        const res = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            participantId: userId
        })
      });
      const data = await res.json();
      console.log("Conversation response:", data);
        const id = data.id;

        setConversation(id);
        setSelectedUserId(userId);
        sendConversationId(id); 
        onUserSelect?.(); // Close sidebar on mobile
        await console.log("CONVERSATIE", conversation);
    }

    if(!users) return( 
        <div>Loading...</div>
    ) 

    return(
        <div className="flex flex-col gap-2 p-2">
            {users.map((user: LoadedUser) => (
            <div 
                key={user.id}
                onClick={() => {handleMessagesUserClicked(user.id); setChatHeaderUser(user.username || ""); }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    selectedUserId === user.id 
                        ? "bg-indigo-500 text-white shadow-md" 
                        : "hover:bg-slate-100 text-slate-900"
                }`}
            >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold ${
                    selectedUserId === user.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-300 text-slate-600"
                }`}>
                <span>{user.username?.charAt(0).toUpperCase() || "?"}</span>
                </div>

                <p className={`font-medium text-sm ${selectedUserId === user.id ? "text-white" : "text-slate-900"}`}>{user.username}</p>
            </div>
            ))}
        </div>
    )
}