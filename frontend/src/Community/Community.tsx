import { useState } from 'react';
import { Settings, Plus, Send, Zap, Users, Trophy, MessageSquare, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- MOCK DATA FOR UI VISUALIZATION ---
const MOCK_MESSAGES = [
    { id: 1, author: "TaxWizard_01", avatar: "🧙‍♂️", role: "admin", content: "Welcome to the new community feed! Remember, no tax evasion tips allowed. 😉", type: "TEXT", time: "10:30 AM" },
    { id: 2, author: "AuditRookie", avatar: "👨‍🎓", role: "student", content: "Can someone explain Section 44AD? I'm stuck.", type: "TEXT", time: "10:32 AM" },
    {
        id: 3,
        author: "TaxWizard_01",
        avatar: "🧙‍♂️",
        role: "admin",
        type: "CHALLENGE",
        time: "10:35 AM",
        challenge: {
            title: "Quick Fire: Presumptive Taxation",
            question: "What is the presumptive profit rate for digital transactions under Sec 44AD?",
            difficulty: "EASY",
            xp: 50
        }
    },
    { id: 4, author: "FinanceBro", avatar: "🚀", role: "student", content: "Is it 6%?", type: "TEXT", time: "10:36 AM" },
];

const CHANNELS = [
    { id: '1', name: 'General Lounge', type: 'text' },
    { id: '2', name: 'Tax Challenges', type: 'text' },
    { id: '3', name: 'Audit War Room', type: 'text' },
    { id: '4', name: 'Study Lounge', type: 'text' },
];

const MEMBERS = [
    { name: "TaxWizard_01", status: "online", role: "Admin" },
    { name: "AuditRookie", status: "idle", role: "Student" },
    { name: "FinanceBro", status: "dnd", role: "Student" },
];

export default function CommunityUI() {
    const { user } = useAuth();
    const [input, setInput] = useState("");
    const [activeChannel, setActiveChannel] = useState('2');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);

    return (
        <div className="flex h-screen bg-transparent text-gray-900 font-sans overflow-hidden static">

            {/* 1. SIDEBAR (Channels) - Mobile Drawer */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 md:w-72 bg-white/95 md:bg-white/40 backdrop-blur-xl md:backdrop-blur-md border-r border-gray-200/50 flex flex-col shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Server Header */}
                <div className="h-14 px-5 flex items-center justify-between border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                    <span className="font-bold text-gray-900 tracking-tight text-sm">Community Hub</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 md:hidden hover:bg-gray-100/50 rounded-lg text-gray-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <button className="hidden md:block p-1.5 hover:bg-gray-100/50 rounded-lg text-gray-500 transition-colors">
                        <Plus size={18} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Find channels..."
                            className="w-full bg-white/50 md:bg-white/50 border border-gray-200/50 rounded-xl py-2 pl-9 pr-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Channel List */}
                <div className="flex-1 overflow-y-auto px-2.5 space-y-0.5">
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-3.5 mt-1.5 mb-2 flex items-center justify-between">
                        Channels
                        <Plus size={12} className="md:hidden cursor-pointer" />
                    </div>
                    {CHANNELS.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => {
                                setActiveChannel(channel.id);
                                if (window.innerWidth < 768) setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${activeChannel === channel.id
                                ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 shadow-sm border border-blue-500/10'
                                : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'}`}
                        >
                            <MessageSquare size={16} className={`mr-2.5 ${activeChannel === channel.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span className="font-semibold text-[13px] truncate">{channel.name}</span>
                            {activeChannel === channel.id && <div className="ml-auto w-1 h-1 rounded-full bg-blue-600 shadow-glow" />}
                        </button>
                    ))}
                </div>

                {/* User Info & Settings */}
                <div className="p-3 bg-gradient-to-b from-transparent to-gray-50/50 border-t border-gray-200/50">
                    <div className="flex items-center px-2.5 py-2 rounded-2xl bg-white/60 border border-white/40 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white border-2 border-white shadow-md">
                            <span className="font-bold text-[13px]">{user?.name?.[0] || 'U'}</span>
                        </div>
                        <div className="ml-2.5 min-w-0 flex-1">
                            <div className="text-[13px] font-bold text-gray-900 truncate leading-tight">{user?.name || 'Explorer'}</div>
                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">#{user?.id?.slice(-4) || '0001'}</div>
                        </div>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Settings size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlays */}
            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" />}
            {membersOpen && <div onClick={() => setMembersOpen(false)} className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" />}

            {/* 2. CHAT AREA (Main Feed) */}
            <div className="flex-1 flex flex-col bg-transparent relative z-10 w-full min-w-0">
                {/* Header */}
                <div className="h-14 md:h-14 border-b border-gray-200/50 bg-white/40 backdrop-blur-md flex items-center px-4 md:px-6 justify-between z-30">
                    <div className="flex items-center min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-1.5 mr-1.5 md:hidden text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu size={18} />
                        </button>
                        <MessageSquare size={18} className="text-blue-600 mr-2 md:mr-2.5 flex-shrink-0" />
                        <div className="truncate">
                            <h2 className="font-bold text-gray-900 text-xs md:text-base tracking-tight truncate leading-tight">
                                {CHANNELS.find(c => c.id === activeChannel)?.name}
                            </h2>
                            <p className="hidden md:block text-[10px] text-gray-500 font-medium tracking-tight">Discussion & Knowledge Sharing</p>
                            <p className="md:hidden text-[9px] text-gray-500 font-bold uppercase tracking-widest">{MEMBERS.length} Active Members</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <button
                            onClick={() => setMembersOpen(!membersOpen)}
                            className="xl:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative"
                        >
                            <Users size={18} />
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 border border-white rounded-full" />
                        </button>

                        {/* Desktop Member Info */}
                        <div className="hidden xl:flex items-center gap-2.5">
                            <div className="flex -space-x-1.5">
                                {MEMBERS.slice(0, 3).map((m, i) => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] font-bold shadow-sm">
                                        {m.name[0]}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{MEMBERS.length} Active</span>
                        </div>
                    </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-5 md:space-y-6 scrollbar-thin scrollbar-thumb-gray-200 bg-gradient-to-b from-transparent to-blue-50/5">
                    {MOCK_MESSAGES.map((msg) => (
                        <div key={msg.id} className="group flex items-start">
                            {/* Avatar */}
                            <div className="w-9 h-9 md:w-11 md:h-11 rounded-2xl bg-white shadow-sm border border-gray-100 flex-shrink-0 mr-3 md:mr-3.5 flex items-center justify-center text-lg md:text-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                                {msg.avatar}
                            </div>

                            {/* Message Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center mb-1 md:mb-1 flex-wrap gap-x-2">
                                    <span className={`font-bold text-[13px] md:text-[15px] ${msg.role === 'admin' ? 'text-pink-600' : 'text-blue-700'}`}>
                                        {msg.author}
                                    </span>
                                    {msg.role === 'admin' && (
                                        <span className="bg-pink-100 text-pink-700 text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded-full border border-pink-200 uppercase tracking-tight">
                                            Partner
                                        </span>
                                    )}
                                    <span className="text-[8px] md:text-[10px] text-gray-400 font-bold">{msg.time}</span>
                                </div>

                                {/* --- RENDER LOGIC: TEXT VS CHALLENGE --- */}
                                {msg.type === 'TEXT' ? (
                                    <div className="relative inline-block px-3.5 md:px-4 py-2 md:py-2.5 rounded-2xl md:rounded-[1.25rem] bg-white border border-gray-100 shadow-sm text-gray-700 text-[13px] md:text-[15px] leading-relaxed max-w-[95%] md:max-w-xl">
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                ) : msg.challenge ? (
                                    // THE CHALLENGE WIDGET
                                    <div className="mt-1.5 max-w-full md:max-w-[400px] bg-gradient-to-br from-white to-amber-50/30 border border-amber-200 shadow-lg rounded-2xl md:rounded-3xl p-4 md:p-5 ring-4 ring-white/50 backdrop-blur-sm group hover:scale-[1.01] md:hover:scale-[1.02] transition-all">
                                        <div className="flex justify-between items-start mb-2.5 md:mb-3">
                                            <div className="flex items-center text-amber-600 font-black text-[8px] md:text-[9px] uppercase tracking-[0.1em] bg-amber-100 px-2 py-1 rounded-full border border-amber-200 shadow-sm">
                                                <Zap size={10} className="mr-1 md:mr-1.5 fill-current" />
                                                Flash Drill
                                            </div>
                                            <div className="text-[8px] md:text-[9px] bg-white text-blue-600 px-2 py-1 rounded-full font-black flex items-center shadow-md border border-blue-100">
                                                <Trophy size={9} className="mr-1 md:mr-1.5 text-amber-500" /> +{msg.challenge.xp} XP
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-1.5 text-[13px] md:text-[16px] tracking-tight leading-tight">{msg.challenge.title}</h3>
                                        <p className="text-gray-600 text-[11px] md:text-[13px] mb-4 md:mb-5 leading-relaxed font-medium">{msg.challenge.question}</p>

                                        <div className="flex flex-col sm:flex-row gap-1.5">
                                            <input
                                                type="text"
                                                placeholder="Answer..."
                                                className="bg-white text-[13px] md:text-[14px] rounded-xl px-3.5 md:px-4 py-2 md:py-2.5 flex-1 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300 shadow-inner"
                                            />
                                            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[9px] md:text-[10px] font-black px-4 md:px-5 py-2 md:py-2.5 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wider">
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Box */}
                <div className="p-3.5 md:p-5 bg-transparent">
                    <div className="max-w-4xl mx-auto bg-white border border-gray-200/60 rounded-2xl md:rounded-[2rem] p-1 md:p-1.5 flex items-center shadow-lg shadow-blue-500/5 group focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                        <button className="hidden sm:flex w-9 h-9 md:w-10 md:h-10 bg-gray-50 hover:bg-blue-50 rounded-full items-center justify-center text-blue-600 transition-colors">
                            <Plus size={18} />
                        </button>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="bg-transparent flex-1 text-gray-900 px-3 md:px-3 outline-none placeholder:text-gray-400 font-medium text-[13px] md:text-[15px] min-w-0"
                            placeholder={`Message...`}
                        />
                        <div className="flex items-center gap-1 md:gap-1.5 md:pr-0.5">
                            <button className="w-9 h-9 md:w-10 md:h-10 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-full flex items-center justify-center transition-all">
                                <Zap size={20} className="scale-90 md:scale-100" />
                            </button>
                            <button className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all">
                                <Send size={16} className="translate-x-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MEMBER LIST (Right Sidebar) - Mobile Overlay/Drawer */}
            <div className={`
                fixed xl:static inset-y-0 right-0 z-50 w-64 md:w-72 bg-white/95 xl:bg-white/40 backdrop-blur-xl xl:backdrop-blur-md border-l border-gray-200/50 flex flex-col p-5 shadow-2xl xl:shadow-none transform transition-transform duration-300 ease-in-out
                ${membersOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
            `}>
                <div className="flex items-center justify-between mb-6 xl:mb-5">
                    <div className="font-black text-[9px] text-gray-400 uppercase tracking-[0.2em] flex items-center">
                        <Users size={12} className="mr-1.5" />
                        Community — {MEMBERS.length}
                    </div>
                    <button
                        onClick={() => setMembersOpen(false)}
                        className="xl:hidden p-1.5 hover:bg-gray-100/50 rounded-lg text-gray-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 overflow-y-auto pr-1">
                    {MEMBERS.map((member, i) => (
                        <div key={i} className="flex items-center group cursor-pointer hover:translate-x-1 transition-transform">
                            <div className="relative">
                                <div className={`w-8 h-8 rounded-2xl ${i === 0 ? 'bg-gradient-to-br from-pink-500 to-purple-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'} flex items-center justify-center text-white font-bold text-[13px] shadow-md border-2 border-white`}>
                                    {member.name[0]}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full shadow-sm ${member.status === 'online' ? 'bg-emerald-500' :
                                        member.status === 'idle' ? 'bg-amber-400' : 'bg-red-400'
                                    }`}></div>
                            </div>
                            <div className="ml-3 min-w-0">
                                <div className={`font-bold text-[13px] truncate ${member.role === 'Admin' ? 'text-pink-600' : 'text-gray-900 group-hover:text-blue-600'} transition-colors`}>
                                    {member.name}
                                </div>
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{member.role}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 flex flex-col items-center text-center shadow-inner">
                    <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                        <Zap className="text-blue-600" size={20} />
                    </div>
                    <h4 className="text-[13px] font-bold text-blue-900 mb-1 tracking-tight">Weekly Challenge</h4>
                    <p className="text-[9px] text-blue-600/70 font-bold mb-3 leading-tight uppercase tracking-wider">Join the Audit War Room<br />at 6 PM IST Today</p>
                    <button className="w-full py-2.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-md transform active:scale-95 transition-all">
                        Remind Me
                    </button>
                </div>
            </div>

        </div>
    );
}
