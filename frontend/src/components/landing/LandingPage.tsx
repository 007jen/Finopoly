import React, { useEffect, useState } from 'react';
import { Shield, Award, Zap, ArrowRight, Layout, Globe, ShieldCheck, Activity, BookOpen, UserCheck, Code2, Clock, Layers, Users, Star, TrendingUp } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const position = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            setScrolled(position / height);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#070718] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; filter: blur(100px); }
                    50% { opacity: 0.6; filter: blur(140px); }
                }
                .animate-fade-in { animation: fade-in-up 1s ease-out forwards; }
                .animate-delay-1 { animation-delay: 0.2s; }
                .animate-delay-2 { animation-delay: 0.4s; }
                .animate-delay-3 { animation-delay: 0.6s; }
                
                .glass-purple {
                    background: rgba(139, 92, 246, 0.05);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                }
                .text-gradient {
                    background: linear-gradient(to bottom, #fff 30%, #a78bfa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .perspective-1000 { perspective: 1000px; }
            `}</style>

            {/* --- NAVIGATION --- */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-8 py-6 ${scrolled > 0.02 ? 'bg-[#070718]/80 backdrop-blur-xl border-b border-white/5 py-4' : ''}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)] group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Finopoly</span>
                    </div>

                    <div className="hidden md:flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                        <a href="#story" className="hover:text-purple-400 transition-colors">The Story</a>
                        <a href="#arena" className="hover:text-purple-400 transition-colors">The Arena</a>
                        <a href="#mastery" className="hover:text-purple-400 transition-colors">Mastery</a>
                        <a href="#community" className="hover:text-purple-400 transition-colors">Collective</a>
                    </div>

                    <button onClick={onGetStarted} className="px-8 py-2.5 bg-white text-[#070718] rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        Enter App
                    </button>
                </div>
            </nav>

            {/* --- CHAPTER 1: THE GRIND (Hero) --- */}
            <section id="story" className="relative min-h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent opacity-50" />
                <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[180px] animate-[pulse-glow_8s_infinite]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[180px] animate-[pulse-glow_10s_infinite]" />

                <div className="relative z-10 text-center max-w-5xl opacity-0 animate-fade-in">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12 animate-fade-in animate-delay-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        The Story of the Grind
                    </div>

                    <h1 className="text-6xl md:text-[140px] font-black leading-[0.85] tracking-tighter mb-12 text-gradient animate-fade-in animate-delay-2">
                        CHISELED <br /> IN <span className="italic">CODE</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto mb-16 leading-relaxed animate-fade-in animate-delay-3 px-4">
                        1,000+ lines of raw logic. 80+ hours of relentless engineering. A platform built by the obsessed, for the future masters of finance.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mb-20">
                        {[
                            { icon: Code2, label: 'Lines written', value: '1K+' },
                            { icon: Clock, label: 'Hours spent', value: '80+' },
                            { icon: Layers, label: 'Modules', value: '06' },
                            { icon: ShieldCheck, label: 'Simulations', value: '150+' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-purple p-6 rounded-3xl border border-white/5 opacity-0 animate-fade-in" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                                <stat.icon className="w-5 h-5 text-purple-500 mb-4" />
                                <div className="text-3xl font-black mb-1">{stat.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <button onClick={onGetStarted} className="group flex items-center gap-6 px-12 py-6 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_30px_60px_-15px_rgba(139,92,246,0.6)]">
                        Start Your Journey <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                {/* Perspective Grid Floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[40vh] pointer-events-none overflow-hidden opacity-30">
                    <div className="absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(to right, rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.2) 1px, transparent 1px)`,
                            backgroundSize: '80px 80px',
                            transform: `perspective(1000px) rotateX(70deg) translateY(${scrolled * -100}px)`,
                            transformOrigin: 'bottom',
                            maskImage: 'linear-gradient(to top, black, transparent)'
                        }}
                    />
                </div>
            </section>

            {/* --- CHAPTER 2: THE ARENA (Bento Modules) --- */}
            <section id="arena" className="relative z-10 py-48 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full lg:h-[800px]">

                    {/* Main Feature: Audit Arena */}
                    <div className="lg:col-span-8 glass-purple rounded-[3rem] p-12 flex flex-col justify-end group overflow-hidden relative border border-white/5 hover:border-purple-500/50 transition-colors">
                        <div className="absolute top-12 left-12 w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.4)]">
                            <Activity className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                            <Activity className="w-[500px] h-[500px]" />
                        </div>
                        <div className="relative z-10 mt-auto">
                            <h2 className="text-5xl font-black mb-6 tracking-tight">AUDIT ARENA</h2>
                            <p className="text-gray-400 text-lg max-w-md mb-8 leading-relaxed">
                                Step into high-fidelity environments. Verify 150+ real-world assertions, analyze complex ledgers, and master Ind AS 115 standards.
                            </p>
                            <div className="flex gap-4">
                                <span className="px-4 py-2 bg-purple-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20">Real Docs</span>
                                <span className="px-4 py-2 bg-purple-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20">Interactive ledgers</span>
                            </div>
                        </div>
                    </div>

                    {/* Side Info: Tax & Drills */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="flex-1 glass-purple rounded-[3rem] p-10 flex flex-col justify-center border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Layout className="w-12 h-12 text-purple-500 mb-8" />
                            <h3 className="text-3xl font-black mb-4">TAX SANDBOX</h3>
                            <p className="text-sm text-gray-500 leading-relaxed uppercase tracking-tight font-black">Corporate Tax + VAT Simulations</p>
                        </div>
                        <div className="flex-1 glass-purple rounded-[3rem] p-10 flex flex-col justify-center border border-white/5 hover:border-purple-500/50 transition-colors bg-gradient-to-br from-purple-600/20 to-transparent">
                            <Zap className="w-12 h-12 text-purple-400 mb-8" />
                            <h3 className="text-3xl font-black mb-4">DAILY DRILLS</h3>
                            <p className="text-sm text-gray-500 leading-relaxed uppercase tracking-tight font-black">10-Minute Technical Workouts</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CHAPTER 3: MASTERY (Gamification) --- */}
            <section id="mastery" className="relative py-48 px-8 overflow-hidden bg-white/2">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
                    <div className="flex-1">
                        <div className="inline-block px-4 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black mb-8 uppercase tracking-[0.4em]">The Progression System</div>
                        <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-tight">ASCEND THE <br /> <span className="text-purple-500">HIERARCHY</span></h2>
                        <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                            Earn XP, unlock Tier 1 badges, and dominate the leaderboard. We don't just teach finance; we build your professional profile.
                        </p>
                        <div className="space-y-6">
                            {[
                                { icon: Star, label: 'XP-Based leveling' },
                                { icon: Award, label: 'Verified competence badges' },
                                { icon: TrendingUp, label: 'Dynamic performance stats' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                                        <item.icon className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <span className="text-lg font-bold uppercase tracking-widest text-gray-300">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual: Mock XP Card */}
                    <div className="flex-1 w-full flex items-center justify-center">
                        <div className="relative perspective-1000 rotate-y-[-10deg] rotate-x-[10deg]">
                            <div className="w-80 h-[500px] glass-purple rounded-[3rem] p-10 border border-white/20 relative shadow-[0_50px_100px_rgba(0,0,0,0.6)] animate-[float_6s_infinite]">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent rounded-[3rem]" />
                                <div className="relative">
                                    <div className="w-16 h-16 bg-purple-600 rounded-2xl mb-12 shadow-[0_0_30px_rgba(139,92,246,0.6)]" />
                                    <div className="h-4 w-3/4 bg-white/10 rounded-full mb-4" />
                                    <div className="h-4 w-1/2 bg-white/5 rounded-full mb-12" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                                        <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                                    </div>
                                </div>
                                <div className="absolute bottom-10 left-10 right-10">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-2">Reputation: ELITE</div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-[72%] shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CHAPTER 4: THE COLLECTIVE (Community + Trust) --- */}
            <section id="community" className="py-48 px-8 max-w-7xl mx-auto border-t border-white/5">
                <div className="text-center mb-32">
                    <h2 className="text-6xl font-black mb-8 tracking-tighter">THE COLLECTIVE</h2>
                    <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">Used by 10,000+ students from Tier 1 Indian and Global firms. Join the legacy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="glass-purple p-12 rounded-[4rem] text-center border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-purple-600/5 transition-all group-hover:bg-purple-600/10" />
                        <ShieldCheck className="w-32 h-32 text-purple-500/40 mx-auto mb-10" />
                        <h4 className="text-4xl font-black mb-4">TIER 1 TRUST</h4>
                        <p className="text-gray-500 uppercase tracking-[0.3em] font-black text-xs">Simulating Real Firm Engagements</p>
                    </div>
                    <div className="glass-purple p-12 rounded-[4rem] text-center border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-600/5 transition-all group-hover:bg-indigo-600/10" />
                        <Users className="w-32 h-32 text-indigo-500/40 mx-auto mb-10" />
                        <h4 className="text-4xl font-black mb-4">10K+ PEERS</h4>
                        <p className="text-gray-500 uppercase tracking-[0.3em] font-black text-xs">Active Community Learning</p>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="pt-48 pb-16 px-8 border-t border-white/5 bg-[#070718]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between gap-24 mb-32">
                        <div className="max-w-sm">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold">Finopoly</span>
                            </div>
                            <p className="text-gray-500 text-lg leading-relaxed font-medium">
                                The ultimate playground for financial masters. Chiseled in code, built for the elite.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-24">
                            <div>
                                <h5 className="font-black text-xs uppercase tracking-[0.4em] text-white mb-10">Navigation</h5>
                                <ul className="space-y-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <li><a href="#" className="hover:text-purple-400">The Story</a></li>
                                    <li><a href="#" className="hover:text-purple-400">Audit Arena</a></li>
                                    <li><a href="#" className="hover:text-purple-400">Tax Sandbox</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-black text-xs uppercase tracking-[0.4em] text-white mb-10">Resources</h5>
                                <ul className="space-y-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <li><a href="#" className="hover:text-purple-400">Methodology</a></li>
                                    <li><a href="#" className="hover:text-purple-400">Curriculum</a></li>
                                    <li><a href="#" className="hover:text-purple-400">Legal</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">
                            © 2024 FINOPOLY • BUILT FOR MASTERS
                        </div>
                        <div className="flex gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border border-white/10 hover:border-purple-500 transition-colors cursor-pointer" />
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
