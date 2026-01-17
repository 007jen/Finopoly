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
        <div className="h-[calc(100dvh-60px)] bg-slate-100/40 p-0 flex flex-col relative overflow-hidden">

            {/* --- ADAPTIVE ANIMATED BACKGROUND IMPROVED --- */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-blue-100/40 blur-[100px] rounded-full animate-pulse duration-[8s]"></div>
                <div className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[50%] bg-slate-200/50 blur-[100px] rounded-full animate-pulse duration-[12s]"></div>
            </div>

            {/* --- MAIN CONTAINED BODY (Reduced by ~6%) --- */}
            <div className="flex flex-col w-full h-full max-w-full bg-[#f8fafc] text-slate-900 font-sans rounded-none shadow-none border-none overflow-hidden relative z-10 flex-1">

                {/* --- HEADER --- */}
                <div className="h-14 sm:h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-3 sm:px-6 z-20">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="bg-blue-600 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-600/20 transition-transform hover:scale-105 active:scale-95">
                            <MessageSquare size={16} className="text-white sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-base sm:text-lg lg:text-2xl tracking-tight text-slate-900">Community Hub</h1>
                            <p className="text-[9px] sm:text-[10px] text-blue-600 font-black flex items-center gap-1.5 uppercase tracking-widest">

                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-slate-200/50">
                            <Shield size={16} className="text-blue-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
                                <span className="text-blue-600">{room}</span>
                            </span>
                        </div>
                        {/* <div className="flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 rounded-full border border-blue-100/50 transition-colors hover:bg-blue-100">
                            <Users size={16} className="text-blue-700 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-700">124 Pro Nodes</span>
                        </div> */}
                    </div>
                </div>

                {/* --- CHAT STREAM --- */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-8 space-y-4 sm:space-y-6 relative no-scrollbar z-10">
                    {/* Professional Mesh Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mt-12"></div>

                    {/* System Notification */}
                    <div className="flex justify-center my-4 sm:my-6">
                        <div className="bg-white/60 backdrop-blur-md text-slate-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] py-1.5 px-4 sm:px-6 rounded-full border border-slate-200/50 shadow-sm transition-all hover:bg-white/80 text-center mx-4">
                            Instant Peer-to-Peer Learning Network Established
                        </div>
                    </div>

                    {messageList.map((msg, idx) => {
                        const authorName = String(msg.author || "Member");
                        const isMe = authorName === String(user?.name || "Member");
                        const isChallenge = msg.challengeData?.isChallenge;
                        const isSolved = msg.challengeData?.isSolved;

                        return (
                            <div key={msg.id || `msg-${idx}`} className={`flex gap-3 sm:gap-4 ${isMe ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-400`}>

                                {/* Avatar */}
                                <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-sm font-black text-white shadow-lg flex-shrink-0 transition-all hover:scale-110 ring-2 ring-white/50 ${getAvatarColor(authorName)}`}>
                                    {authorName.charAt(0).toUpperCase()}
                                </div>

                                {/* Content Bubble */}
                                <div className={`flex flex-col max-w-[90%] sm:max-w-[75%] lg:max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                                    <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                        <span className={`text-xs sm:text-sm font-black uppercase tracking-widest ${isMe ? "text-blue-600" : "text-slate-500"}`}>
                                            {authorName}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-slate-400 font-bold opacity-80 uppercase tracking-tighter">
                                            {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                                        </span>
                                    </div>

                                    {isChallenge ? (
                                        /* --- 🏆 THE CHALLENGE WIDGET --- */
                                        <div className={`bg-white/90 backdrop-blur-sm border-2 ${isSolved ? 'border-emerald-100 shadow-sm' : 'border-blue-100/80 shadow-xl shadow-blue-500/5'} rounded-xl sm:rounded-2xl p-3 sm:p-5 w-full max-w-sm group transition-all hover:border-blue-400/30`}>
                                            <div className="flex justify-between items-center mb-2 sm:mb-4">
                                                <div className={`flex items-center ${isSolved ? 'text-emerald-600' : 'text-blue-600'} text-[8px] sm:text-[10px] font-black uppercase tracking-widest`}>
                                                    <div className={`p-1 rounded-lg mr-1.5 sm:mr-2 ${isSolved ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                                                        <Zap size={12} className={`${isSolved ? 'fill-emerald-600' : 'fill-blue-600'} sm:w-[14px] sm:h-[14px]`} />
                                                    </div>
                                                    {isSolved ? "Drill Resolved" : "Active Peer Drill"}
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-400 transition-colors">
                                                    <TrendingUp size={10} className="sm:w-[12px] sm:h-[12px]" />
                                                    <span className="text-[7.5px] sm:text-[9px] font-bold uppercase tracking-tighter">Skill Booster</span>
                                                </div>
                                            </div>

                                            <p className={`font-bold text-[12.5px] sm:text-[15px] mb-3 sm:mb-4 leading-relaxed ${isSolved ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                                                {msg.content}
                                            </p>

                                            {isSolved ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-emerald-50/80 backdrop-blur-sm py-2 px-3 rounded-xl border border-emerald-100/50">
                                                    <CheckCircle size={12} /> Resolved by {msg.challengeData.winner}
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Solve this drill..."
                                                        className="flex-1 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900 placeholder:text-slate-400 shadow-inner font-medium"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") submitAnswer(msg.id, e.currentTarget.value);
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.parentElement?.querySelector('input');
                                                            if (input) submitAnswer(msg.id, input.value);
                                                        }}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20"
                                                    >
                                                        Solve
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* --- 💬 STANDARD TEXT --- */
                                        <div className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-sm leading-relaxed relative group transition-all border
                                            ${isMe ? "bg-blue-600 text-white border-blue-700 rounded-tr-none shadow-blue-600/10"
                                                : "bg-white/95 backdrop-blur-sm text-slate-700 border-slate-200/70 rounded-tl-none hover:border-slate-300"
                                            }`}>
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} className="h-4" />
                </div>

                {/* --- COMPACT CHALLENGE CREATOR --- */}
                {isChallMode && (
                    <div className="mx-4 sm:mx-8 mb-4 animate-in slide-in-from-bottom-4 duration-400 z-20">
                        <div className="bg-white/95 backdrop-blur-xl border-2 border-blue-500/80 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 animate-gradient-x bg-[length:200%_auto]"></div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2.5 text-blue-600">
                                    <div className="p-1.5 rounded-lg bg-blue-50">
                                        <Zap size={16} className="fill-blue-600" />
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em]">Create Community Drill</span>
                                </div>
                                <button onClick={() => setIsChallMode(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">The Question</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your audit question..."
                                        value={challQuest}
                                        onChange={(e) => setChallQuest(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && sendChallenge()}
                                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:bg-white transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="space-y-1 relative">
                                    <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">The Answer</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Hidden solution..."
                                            value={challAns}
                                            onChange={(e) => setChallAns(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && sendChallenge()}
                                            className="flex-1 bg-slate-50/50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:bg-white transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                                        />
                                        <button
                                            onClick={sendChallenge}
                                            disabled={!challQuest.trim() || !challAns.trim()}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:grayscale text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                                        >
                                            Deploy <Send size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- INPUT AREA --- */}
                <div className="pt-2 px-2 pb-0 sm:p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200/40 z-20">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-1.5 sm:gap-3 bg-white p-1 rounded-xl sm:rounded-2xl border border-slate-200 focus-within:border-blue-500/50 focus-within:ring-8 focus-within:ring-blue-500/5 transition-all shadow-lg shadow-slate-200/50">
                            <button
                                onClick={() => setIsChallMode(!isChallMode)}
                                className={`p-2.5 sm:p-3 rounded-xl transition-all ${isChallMode ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 ring-4 ring-blue-500/10' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                title="Drop a Drill"
                            >
                                <Plus size={20} className={`sm:w-5 sm:h-5 transition-transform duration-300 ${isChallMode ? 'rotate-45' : ''}`} />
                            </button>

                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Collaborate with peers..."
                                className="flex-1 bg-transparent text-slate-700 text-sm sm:text-base px-1.5 sm:px-3 py-2 outline-none placeholder-slate-400 font-bold"
                            />

                            <button
                                onClick={sendMessage}
                                disabled={!message.trim()}
                                className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:grayscale transform active:scale-90 shadow-xl shadow-blue-600/20"
                            >
                                <Send size={16} className="sm:w-[18px] sm:h-[18px] translate-x-0.5 -translate-y-0.5" />
                            </button>
                        </div>

                        <div className="sm:flex justify-center mt-3 sm:mt-4">
                            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-400 font-black bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200/50 uppercase tracking-[0.05em] transition-all hover:bg-white/80">
                                <Sparkles size={12} className="text-blue-500 animate-pulse" />
                                Drop a live drill by clicking the <Plus size={10} className="inline mx-0.5" /> button
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FOUL POLICE MODAL (HIDDEN) --- */}
            {false && showWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-red-500 max-w-md w-full overflow-hidden transform animate-in zoom-in-95 duration-300">
                        <div className="bg-red-500 p-6 flex flex-col items-center gap-2">
                            <div className="flex gap-2">
                                <span className="text-4xl animate-bounce">🚨</span>
                                <Shield className="text-white w-12 h-12" />
                                <span className="text-4xl animate-bounce">🚔</span>
                            </div>
                            <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Foul Police Active</h2>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-slate-600 font-bold mb-6 leading-relaxed">
                                {warningMessage.replace("Message blocked: ", "")}
                            </p>
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8">
                                <p className="text-red-600 text-[10px] font-black uppercase tracking-widest">
                                    Final Warning: Please maintain professional conduct in the community hub.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                            >
                                Understood, Officer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Animations in Tailwind Global (Conceptual - standard classes used above) */}
            <style>{`
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-x {
                    animation: gradient-x 4s ease infinite;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
