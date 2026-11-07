import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { Send, Zap, Users, Sparkles, CheckCircle, MessageSquare, Shield, TrendingUp, X, Plus } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";

// Backend port is 5000 (Local) or Production URL
// Backend port is 5000 (Local) or Production URL
// const SOCKET_URL = isProduction
//     ? "https://api.tryfinopoly.com"
//     : (import.meta.env.VITE_API_URL || "http://localhost:5000");
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Financial/Professional avatar colors
const getAvatarColor = (name: string) => {
    if (!name || name === "SYSTEM") return "bg-gray-400";
    const colors = ["bg-blue-500", "bg-indigo-500", "bg-slate-500", "bg-cyan-600", "bg-blue-700", "bg-indigo-700"];
    return colors[(name.length || 0) % colors.length];
};

export default function Phase1Chat() {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [messageList, setMessageList] = useState<any[]>([]);
    const [room] = useState("General Lounge");
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    // --- Challenge Creator State ---
    const [isChallMode, setIsChallMode] = useState(false);
    const [challQuest, setChallQuest] = useState("");
    const [challAns, setChallAns] = useState("");

    // --- Foul Police UI State ---
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");

    // --- SOCKET LOGIC ---
    useEffect(() => {
        // Initialize connection
        socketRef.current = io(SOCKET_URL, {
            auth: { token: "PHASE_1_TEST_TOKEN" },
            transports: ["polling", "websocket"]
        });

        socketRef.current.emit("join_room", room);

        // 🕒 Load historical messages
        socketRef.current.on("load_history", (history: any[]) => {
            setMessageList(history);
            scrollToBottom();
        });

        // 📩 Listen for new messages
        socketRef.current.on("receive_message", (data) => {
            setMessageList((prev) => {
                if (prev.some(m => m.id === data.id)) return prev;

                const optimisticIndex = prev.findIndex(m =>
                    String(m.id).startsWith("temp-") &&
                    m.content === data.content &&
                    m.author === data.author
                );

                if (optimisticIndex !== -1) {
                    const newList = [...prev];
                    newList[optimisticIndex] = data;
                    return newList;
                }

                return [...prev, data];
            });
            scrollToBottom();
        });

        /* --- AZURE CLOUD START --- */
        // 🛡️ Listen for AI safety blocks
        socketRef.current.on("message_error", (data: { message: string }) => {
            setWarningMessage(data.message);
            setShowWarning(true);
            // Remove the latest optimistic message if it was blocked
            setMessageList((prev) => prev.filter(m => !String(m.id).startsWith("temp-")));
        });
        /* --- AZURE CLOUD END --- */

        // 🏆 Challenge results (Solved notifications)
        socketRef.current.on("challenge_solved_globally", (data: { messageId: string; winner: string }) => {
            setMessageList((prevList) =>
                prevList.map((m) =>
                    m.id === data.messageId
                        ? { ...m, challengeData: { ...m.challengeData, isSolved: true, winner: data.winner } }
                        : m
                )
            );

            // If I won, trigger confetti
            if (data.winner === user?.name) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#8b5cf6', '#fbbf24']
                });
            }
        });

        // Clean up
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [room, user?.name]);

    const scrollToBottom = () => {
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const sendMessage = () => {
        if (!message.trim() || !socketRef.current) return;

        const authorName = String(user?.name || "Member");
        const payload = {
            id: `temp-txt-${Date.now()}`,
            room,
            author: authorName,
            content: message,
            type: "TEXT",
            time: new Date().toISOString()
        };

        socketRef.current.emit("send_message", payload);
        setMessageList((list) => [...list, payload]);
        setMessage("");
        scrollToBottom();
    };

    const sendChallenge = () => {
        if (!challQuest.trim() || !challAns.trim() || !socketRef.current) return;

        const authorName = String(user?.name || "Member");
        const tempId = `temp-chall-${Date.now()}`;

        const payload = {
            id: tempId,
            room,
            author: authorName,
            content: challQuest.trim(),
            time: new Date().toISOString(),
            challengeData: {
                isChallenge: true,
                xpReward: 0,
                isSolved: false
            }
        };

        socketRef.current.emit("broadcast_challenge", {
            room,
            content: challQuest.trim(),
            answer: challAns.trim(),
            xpReward: 0,
            author: authorName
        });

        setMessageList((list) => [...list, payload]);
        setChallQuest("");
        setChallAns("");
        setIsChallMode(false);
        scrollToBottom();
    };

    const submitAnswer = (messageId: string, answer: string) => {
        if (!socketRef.current || !answer || !user?.name) return;

        socketRef.current.emit("submit_challenge_answer", {
            messageId,
            answer,
            username: user.name
        });
    };

    return (
        <div className="h-[calc(100dvh-60px)] bg-gray-50 flex flex-col relative overflow-hidden">
            {/* --- MAIN CONTAINED BODY --- */}
            <div className="flex flex-col w-full h-full max-w-6xl mx-auto bg-white text-slate-900 font-sans border-x border-gray-100 overflow-hidden relative z-10 flex-1 shadow-sm">

                {/* --- HEADER --- */}
                <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-md">
                            <MessageSquare size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-none">Community Lounge</h1>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-1">Networking & Growth</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <Shield size={14} className="text-blue-600" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                                {room}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- CHAT STREAM --- */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10 bg-gray-50/30">
                    <div className="flex justify-center mb-8">
                        <div className="bg-white px-4 py-1 rounded-full border border-gray-100 shadow-sm text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Beginning of the conversation
                        </div>
                    </div>

                    {messageList.map((msg, idx) => {
                        const authorName = String(msg.author || "Member");
                        const isMe = authorName === String(user?.name || "Member");
                        const isChallenge = msg.challengeData?.isChallenge;
                        const isSolved = msg.challengeData?.isSolved;

                        return (
                            <div key={msg.id || `msg-${idx}`} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0 transition-transform hover:scale-105 ${getAvatarColor(authorName)}`}>
                                    {authorName.charAt(0).toUpperCase()}
                                </div>

                                {/* Content Bubble */}
                                <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                                    <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                        <span className={`text-[11px] font-bold ${isMe ? "text-blue-600" : "text-gray-500"}`}>
                                            {authorName}
                                        </span>
                                        <span className="text-[9px] text-gray-300 font-medium">
                                            {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                                        </span>
                                    </div>

                                    {isChallenge ? (
                                        /* --- CHALLENGE WIDGET --- */
                                        <div className={`bg-white border ${isSolved ? 'border-emerald-100' : 'border-blue-100'} rounded-2xl p-4 w-full max-w-sm shadow-sm transition-all hover:shadow-md`}>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className={`flex items-center gap-1.5 ${isSolved ? 'text-emerald-600' : 'text-blue-600'} text-[9px] font-bold uppercase tracking-widest`}>
                                                    <Zap size={12} className={isSolved ? 'fill-emerald-600' : 'fill-blue-600'} />
                                                    {isSolved ? "Drill Resolved" : "Community Drill"}
                                                </div>
                                            </div>

                                            <p className={`font-semibold text-sm mb-4 leading-relaxed ${isSolved ? 'text-gray-400 italic' : 'text-slate-800'}`}>
                                                {msg.content}
                                            </p>

                                            {isSolved ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-100">
                                                    <CheckCircle size={12} /> Resolved by {msg.challengeData.winner}
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Your answer..."
                                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-500/30 transition-all font-medium"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") submitAnswer(msg.id, e.currentTarget.value);
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.parentElement?.querySelector('input');
                                                            if (input) submitAnswer(msg.id, input.value);
                                                        }}
                                                        className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                                                    >
                                                        Solve
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* --- TEXT MESSAGE --- */
                                        <div className={`px-4 py-2 rounded-2xl text-sm font-medium shadow-sm leading-relaxed border transition-all
                                            ${isMe ? "bg-blue-600 text-white border-blue-600 rounded-tr-none"
                                                : "bg-white text-slate-700 border-gray-100 rounded-tl-none hover:border-gray-200"
                                            }`}>
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} className="h-2" />
                </div>

                {/* --- COMPACT CHALLENGE CREATOR --- */}
                {isChallMode && (
                    <div className="mx-6 mb-2 animate-in slide-in-from-bottom-4 duration-300 z-20">
                        <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Zap size={14} className="fill-blue-600" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">New Community Drill</span>
                                </div>
                                <button onClick={() => setIsChallMode(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Enter question..."
                                    value={challQuest}
                                    onChange={(e) => setChallQuest(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500/30 transition-all font-semibold"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter answer..."
                                        value={challAns}
                                        onChange={(e) => setChallAns(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && sendChallenge()}
                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500/30 transition-all font-semibold"
                                    />
                                    <button
                                        onClick={sendChallenge}
                                        disabled={!challQuest.trim() || !challAns.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                                    >
                                        Post <Send size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- INPUT AREA --- */}
                <div className="p-4 sm:p-6 bg-white border-t border-gray-100 z-20">
                    <div className="max-w-4xl mx-auto flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 transition-all shadow-sm focus-within:bg-white focus-within:border-blue-500/20 focus-within:shadow-md">
                        <button
                            onClick={() => setIsChallMode(!isChallMode)}
                            className={`p-2 rounded-xl transition-all ${isChallMode ? 'bg-blue-600 text-white shadow-md rotate-45' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            title="Create Drill"
                        >
                            <Plus size={18} />
                        </button>

                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent text-slate-700 text-sm px-2 py-1.5 outline-none font-medium"
                        />

                        <button
                            onClick={sendMessage}
                            disabled={!message.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shadow-sm hover:scale-105 active:scale-95"
                        >
                            <Send size={16} className="translate-x-0.5 -translate-y-0.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- FOUL POLICE MODAL --- */}
            {showWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-red-100 max-w-sm w-full overflow-hidden transform animate-in zoom-in-95 duration-300">
                        <div className="bg-red-50 to-red-600 p-6 flex flex-col items-center gap-2 border-b border-red-100">
                            <Shield className="text-red-500 w-10 h-10" />
                            <h2 className="text-red-600 font-bold text-lg uppercase tracking-widest mt-2">Community Guidelines</h2>
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-slate-600 font-medium mb-6 text-sm leading-relaxed">
                                {warningMessage.replace("Message blocked: ", "")}
                            </p>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
