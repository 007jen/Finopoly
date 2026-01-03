import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

// Architect Note: Connect to the backend port (5000), not the frontend.
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Phase1Chat() {
    const [room] = useState("General Lounge");
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [messageList, setMessageList] = useState<any[]>([]);
    const [joined, setJoined] = useState(false);

    // 🎲 Level 2: User Challenge Creation State
    const [challengeMode, setChallengeMode] = useState(false);
    const [challQuest, setChallQuest] = useState("");
    const [challAns, setChallAns] = useState("");

    // Use ref to persist socket across renders without re-connecting
    const socketRef = useRef<Socket | null>(null);

    const joinRoom = () => {
        if (!username || !room) return;

        // Initialize connection
        socketRef.current = io(SOCKET_URL, {
            auth: { token: "PHASE_1_TEST_TOKEN" },
            transports: ["polling", "websocket"] // Force websocket for reliability
        });

        // 🕒 Phase 3: Catch the historical sync
        socketRef.current.on("load_history", (history: any[]) => {
            setMessageList(history);
        });

        socketRef.current.emit("join_room", room);
        setJoined(true);

        // Listener for incoming messages
        socketRef.current.on("receive_message", (data) => {
            setMessageList((list) => [...list, data]);
        });

        // 🏆 Phase 2: Results of our guess
        socketRef.current.on("challenge_result", (result: { success: boolean; message: string; xpEarned: number }) => {
            if (result.success) {
                alert(`🎊 ${result.message} +${result.xpEarned} XP!`);
            } else {
                alert(`❌ ${result.message}`);
            }
        });

        // 👁️ Phase 2: Notification when someone else solves it
        socketRef.current.on("challenge_solved_by", (data: { messageId: string; user: string }) => {
            console.log(`Node ${data.user} solved challenge ${data.messageId}`);
        });

        // 🌍 Level 3: Global solve notification
        socketRef.current.on("challenge_solved_globally", (data: { messageId: string; winner: string }) => {
            setMessageList((prevList) =>
                prevList.map((m) =>
                    m.id === data.messageId
                        ? { ...m, challengeData: { ...m.challengeData, isSolved: true, winner: data.winner } }
                        : m
                )
            );
        });

        socketRef.current.on("connect_error", (err) => {
            console.error("[SOCKET-ERR]", err.message);
            alert(`Connection Failed: ${err.message}`);
        });
    };

    const sendMessage = () => {
        if (!message || !socketRef.current) return;

        const payload = {
            room,
            author: username,
            content: message,
            time: new Date().toISOString()
        };

        socketRef.current.emit("send_message", payload);

        // Optimistic UI update
        setMessageList((list) => [...list, payload]);
        setMessage("");
    };

    const sendChallenge = () => {
        if (!challQuest || !challAns || !socketRef.current) return;

        socketRef.current.emit("broadcast_challenge", {
            room,
            content: challQuest,
            answer: challAns,
            xpReward: 150
        });

        // Clear local inputs
        setChallQuest("");
        setChallAns("");
        setChallengeMode(false);
    };

    const submitAnswer = (messageId: string, answer: string) => {
        if (!socketRef.current || !answer) return;

        socketRef.current.emit("submit_challenge_answer", {
            messageId,
            answer,
            username // Level 3: Tell the server who we are
        });
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
            {!joined ? (
                <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md">
                    <h2 className="text-3xl font-black mb-2 text-white tracking-tighter italic">FINOPOLY <span className="text-blue-500">COMMUNITY</span></h2>
                    <p className="text-slate-500 text-sm mb-8 font-medium">Phase 1: Proof of Architecture</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Identity</label>
                            <input
                                type="text"
                                placeholder="e.g. TaxPro_99"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-700 font-bold"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Frequency (Room)</label>
                            <input
                                type="text"
                                defaultValue="General Lounge"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-blue-400"
                                readOnly
                            />
                        </div>
                        <button
                            onClick={joinRoom}
                            disabled={!username}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] mt-4"
                        >
                            Establish Link
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-3xl bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[700px] border border-slate-800 relative ring-1 ring-white/5">
                    {/* Header */}
                    <div className="bg-slate-950/50 backdrop-blur-xl p-6 border-b border-slate-800 flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"></div>
                            <span className="font-black text-xl tracking-tight text-white italic">#{room}</span>
                        </div>
                        <div className="bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Current Node: <span className="text-blue-400">{username}</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-950 to-slate-900 scrollbar-thin scrollbar-thumb-slate-800">
                        {messageList.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
                                <p className="font-black uppercase tracking-[0.3em] text-[10px]">No transmissions detected</p>
                            </div>
                        )}
                        {messageList.map((msg, index) => {
                            const isMe = msg.author === username;
                            const isChallenge = msg.challengeData?.isChallenge;

                            return (
                                <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                                    <div className="flex items-center gap-2 mb-1.5 px-2">
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${isMe ? "text-blue-400" : "text-slate-500"}`}>{msg.author}</span>
                                        {msg.time && (
                                            <span className="text-[9px] text-slate-700 font-medium">
                                                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>

                                    {isChallenge && msg.challengeData?.isSolved ? (
                                        // 🏆 SOLVED STATE
                                        <div className="bg-slate-800/50 p-6 rounded-[2rem] rounded-tl-none border border-emerald-500/30 shadow-xl max-w-sm opacity-80 backdrop-blur-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-2 transform rotate-12 transition-transform group-hover:scale-110">
                                                <div className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg border border-white/20">OFFLINE</div>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20">Drill Completed</span>
                                                <span className="text-[10px] font-bold text-slate-500 italic">Solved by {msg.challengeData.winner}</span>
                                            </div>
                                            <p className="text-slate-400 font-bold text-lg mb-0 line-through decoration-slate-600/50">{msg.content}</p>
                                        </div>
                                    ) : isChallenge ? (
                                        // 💎 THE CHALLENGE WIDGET (ACTIVE)
                                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-[2rem] rounded-tl-none border border-white/20 shadow-2xl max-w-sm">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white">Active Drill</span>
                                                <span className="text-[10px] font-bold text-indigo-200">Earn +{msg.challengeData.xpReward} XP</span>
                                            </div>
                                            <p className="text-white font-bold text-lg mb-4 leading-tight">{msg.content}</p>

                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Type answer..."
                                                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white/20 transition-all text-white placeholder:text-white/40"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") submitAnswer(msg.id, e.currentTarget.value);
                                                    }}
                                                />
                                                <button
                                                    className="bg-white text-indigo-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                                                        submitAnswer(msg.id, input.value);
                                                    }}
                                                >
                                                    Solve
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // 💬 Standard Message
                                        <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-sm font-medium shadow-xl 
                                            ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50"}`}>
                                            <p className="leading-relaxed">{msg.content}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <div className="p-6 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex flex-col gap-4">

                        {/* 🎲 Challenge Mode Toggle */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setChallengeMode(!challengeMode)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                                    ${challengeMode
                                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                        : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${challengeMode ? "bg-white animate-pulse" : "bg-slate-700"}`}></div>
                                {challengeMode ? "Challenge Mode Active" : "Regular Message"}
                            </button>

                            {challengeMode && (
                                <span className="text-[10px] font-bold text-indigo-400 animate-pulse">CREATING LIVE DRILL...</span>
                            )}
                        </div>

                        {challengeMode ? (
                            /* Challenge Inputs */
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <input
                                    type="text"
                                    placeholder="The Question (e.g. What is the standard tax rate?)"
                                    className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700"
                                    value={challQuest}
                                    onChange={(e) => setChallQuest(e.target.value)}
                                />
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="The Secret Answer"
                                        className="flex-1 p-4 bg-slate-950 border border-slate-800 text-indigo-400 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-800"
                                        value={challAns}
                                        onChange={(e) => setChallAns(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && sendChallenge()}
                                    />
                                    <button
                                        onClick={sendChallenge}
                                        disabled={!challQuest || !challAns}
                                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-8 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                                    >
                                        Deploy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Standard Message Input */
                            <div className="flex gap-4 items-center">
                                <div className="flex-1 relative group">
                                    <input
                                        type="text"
                                        value={message}
                                        placeholder={`Message node #${room}...`}
                                        className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium placeholder:text-slate-700"
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                    />
                                </div>
                                <button
                                    onClick={sendMessage}
                                    disabled={!message}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all transform active:scale-90"
                                >
                                    <svg className="w-6 h-6 rotate-45 -translate-y-0.5 -translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}