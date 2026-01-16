import React, { useEffect, useState } from 'react';
import { Shield, Award, Zap, ArrowRight, Layout, Globe, ShieldCheck, Activity, BookOpen, UserCheck, Code2, Clock, Layers, Users, Star, TrendingUp } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

const StatCard = ({ icon: Icon, label, value, suffix = '', prefix = '', format }: any) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000;
        let startTime: number | null = null;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCount(Math.floor(easeOut * value));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [value]);

    const displayValue = format ? format(count) : count;

    return (
        <>
            <Icon className="w-5 h-5 text-purple-500 mb-4" />
            <div className="text-3xl font-black mb-1">{prefix}{displayValue}{suffix}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
        </>
    );
};

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
        <div className="min-h-screen bg-[#070718] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans text-sm md:text-base">
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
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 md:px-8 py-4 md:py-6 ${scrolled > 0.02 ? 'bg-[#070718]/80 backdrop-blur-xl border-b border-purple-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.4)]' : 'border-b border-white/5'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)] group-hover:scale-110 transition-transform">
                            <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <span className="text-lg md:text-xl font-bold tracking-tight">Finopoly</span>
                    </div>

                    <div className="hidden md:flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                        <a href="#story" className="hover:text-purple-400 transition-colors">The Story</a>
                        <a href="#arena" className="hover:text-purple-400 transition-colors">The Arena</a>
                        <a href="#mastery" className="hover:text-purple-400 transition-colors">Mastery</a>
                        <a href="#community" className="hover:text-purple-400 transition-colors">Pedigree</a>
                    </div>

                    <button onClick={onGetStarted} className="px-5 md:px-8 py-2 md:py-2.5 bg-white text-[#070718] rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        Enter App
                    </button>
                </div>
            </nav>

            {/* --- CHAPTER 1: THE GRIND (Hero) --- */}
            <section id="story" className="relative min-h-screen flex flex-col items-center justify-start pt-24 md:pt-32 px-4 md:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent opacity-50" />
                <div className="absolute top-[20%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/20 rounded-full blur-[100px] md:blur-[180px] animate-[pulse-glow_8s_infinite]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-indigo-600/20 rounded-full blur-[100px] md:blur-[180px] animate-[pulse-glow_10s_infinite]" />

                <div className="relative z-10 text-center max-w-5xl opacity-0 animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl md:text-[140px] font-black leading-[0.85] tracking-tighter mb-6 md:mb-8 text-gradient">
                        CHISELED <br /> With <span className="italic">Brain</span>
                    </h1>

                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        The Story of the Grind
                    </div>

                    <p className="text-lg md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto mb-16 leading-relaxed px-4">
                        A platform built for those who find beauty in the ledger. 80+ hours of relentless engineering to create the definitive simulator for financial mastery.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mb-20">
                        {[
                            { icon: Code2, label: 'Lines written', value: 1000, suffix: '+', format: (n: number) => n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n },
                            { icon: Clock, label: 'Hours spent', value: 80, suffix: '+' },
                            { icon: Layers, label: 'Modules', value: 6, prefix: '0' },
                            { icon: ShieldCheck, label: 'Simulations', value: 150, suffix: '+' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-purple p-6 rounded-3xl border border-white/5 animate-fade-in" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                                <StatCard {...stat} />
                            </div>
                        ))}
                    </div>

                    <button onClick={onGetStarted} className="group flex items-center gap-4 md:gap-6 px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl md:rounded-3xl font-black text-base md:text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(139,92,246,0.6)] mx-auto">
                        Start Your Journey <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
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
            <section id="arena" className="relative z-10 py-24 md:py-48 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-full lg:h-[800px]">

                    {/* Main Feature: Audit Arena */}
                    <div className="lg:col-span-8 glass-purple rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col justify-end group overflow-hidden relative border border-white/5 hover:border-purple-500/50 transition-colors">


                        {/* Feature Grid Visualization */}
                        {/* Feature Grid Visualization */}
                        <div className="relative w-full h-auto lg:absolute lg:top-8 lg:right-8 lg:w-[60%] lg:h-[70%] grid grid-cols-1 sm:grid-cols-2 gap-3 content-start lg:opacity-80 pointer-events-none mb-8 lg:mb-0 order-first lg:order-none">
                            <div className="glass-purple rounded-xl p-4 border border-white/10 flex flex-col justify-between transform hover:scale-105 transition-transform duration-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                                    <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider truncate">Live Validation</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[92%]" />
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-mono text-right">92% ACCURACY</div>
                                </div>
                            </div>

                            <div className="glass-purple rounded-xl p-4 border border-white/10 font-mono text-[9px] overflow-hidden">
                                <div className="text-purple-400 mb-2 border-b border-white/10 pb-1">ASSERTION LOG</div>
                                <div className="space-y-1 text-gray-400">
                                    <div className="flex justify-between"><span>Completeness</span><span className="text-green-400">PASSED</span></div>
                                    <div className="flex justify-between"><span>Existence</span><span className="text-green-400">PASSED</span></div>
                                    <div className="flex justify-between"><span>Valuation</span><span className="text-amber-400">REVIEW</span></div>
                                    <div className="flex justify-between opacity-50"><span>Rights</span><span className="text-blue-400">PENDING</span></div>
                                </div>
                            </div>

                            <div className="sm:col-span-2 glass-purple rounded-xl p-4 border border-white/10 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-black uppercase text-purple-300 tracking-wider mb-1">DATA INTEGRITY</div>
                                    <div className="text-[9px] text-gray-500 max-w-[150px]">Blockchain-verified ledger audits active</div>
                                </div>
                                <Activity className="w-8 h-8 text-purple-500/50 shrink-0" />
                            </div>

                            <div className="glass-purple rounded-xl p-4 border border-white/10">
                                <div className="text-[10px] font-black uppercase text-purple-300 tracking-wider mb-2">RISK SCORE</div>
                                <div className="text-3xl font-black text-white mb-1">A+</div>
                                <div className="text-[9px] text-gray-500 font-mono">Top 1% of Auditors</div>
                            </div>

                            <div className="glass-purple rounded-xl p-4 border border-white/10 flex flex-col justify-center">
                                <div className="flex -space-x-2 mb-2">
                                    {[1, 2, 3].map(i => <div key={i} className={`w-6 h-6 rounded-full border border-black bg-purple-${i * 200} flex items-center justify-center text-[8px] font-bold text-black bg-gradient-to-br from-purple-400 to-indigo-400`} />)}
                                </div>
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Multi-player Sync</div>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                            <Activity className="w-[500px] h-[500px]" />
                        </div>
                        <div className="relative z-10 mt-auto">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase">INSIGHTS</h2>
                            <p className="text-gray-400 text-base md:text-lg max-w-md mb-8 leading-relaxed">
                                Deep dive into performance metrics. Verify 150+ real-world assertions, analyze complex ledgers, and master Ind AS 115 standards.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <span className="px-4 py-2 bg-purple-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20">Real Docs</span>
                                <span className="px-4 py-2 bg-purple-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20">Interactive ledgers</span>
                            </div>
                        </div>
                    </div>

                    {/* Side Info: Tax & Drills */}
                    <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
                        <div className="flex-1 glass-purple rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col justify-between border border-white/5 hover:border-purple-500/50 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Layout className="w-32 h-32" />
                            </div>
                            <div>
                                <Layout className="w-10 h-10 md:w-12 md:h-12 text-purple-500 mb-6 md:mb-8" />
                                <h3 className="text-xl md:text-3xl font-black mb-4 uppercase">TAX SANDBOX</h3>
                                <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed uppercase tracking-tight font-black mb-6">Corporate Tax + VAT Simulations</p>
                            </div>

                            {/* Tax Visuals */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <span>Compliance</span>
                                    <span className="text-green-400">98%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[98%]" />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono text-purple-300">GST-R1</div>
                                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono text-purple-300">Form 16</div>
                                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono text-purple-300">TDS</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 glass-purple rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col justify-between border border-white/5 hover:border-purple-500/50 transition-colors bg-gradient-to-br from-purple-600/20 to-transparent group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Zap className="w-32 h-32" />
                            </div>
                            <div>
                                <Zap className="w-10 h-10 md:w-12 md:h-12 text-purple-400 mb-6 md:mb-8" />
                                <h3 className="text-xl md:text-3xl font-black mb-4 uppercase">DAILY DRILLS</h3>
                                <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed uppercase tracking-tight font-black mb-6">10-Minute Brain Workouts</p>
                            </div>

                            {/* Drill Visuals */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                                    <div className="text-2xl font-black text-white mb-1">12</div>
                                    <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Day Streak</div>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                                    <div className="text-2xl font-black text-purple-400 mb-1">850</div>
                                    <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500">XP Earned</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CHAPTER 3: MASTERY (Gamification) --- */}
            <section id="mastery" className="relative py-24 md:py-48 px-4 md:px-8 overflow-hidden bg-white/2">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-16 md:gap-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 w-full items-center">
                        <div className="space-y-8 flex flex-col items-start text-left">
                            <div className="inline-block px-4 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.4em]">The Progression System</div>
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase">ASCEND THE <br /> <span className="text-purple-500">HIERARCHY</span></h2>
                            <p className="text-base md:text-xl text-gray-400 leading-relaxed max-w-sm">
                                Earn XP, unlock achievement badges, and dominate the leaderboard. We don't just teach finance; we build your professional profile.
                            </p>
                            <div className="space-y-4 w-full">
                                {[
                                    { icon: Star, label: 'XP-Based leveling' },
                                    { icon: Award, label: 'Verified competence badges' },
                                    { icon: TrendingUp, label: 'Dynamic performance stats' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 w-full bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30 shrink-0">
                                            <item.icon className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest text-gray-300">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Productive Visual: Rank Card */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-purple-500/20 blur-3xl rounded-full opacity-50" />
                            <div className="relative glass-purple p-8 rounded-[2.5rem] border border-white/10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Current Rank</div>
                                        <div className="text-3xl font-black text-white italic">SENIOR AUDITOR</div>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/50">
                                        <Award className="w-6 h-6 text-yellow-500" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 text-gray-400">
                                            <span>Level 12 Progress</span>
                                            <span className="text-white">2,450 / 3,000 XP</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[82%]" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: 'Global Rank', val: '#42' },
                                            { label: 'Weekly XP', val: '+850' },
                                            { label: 'Streak', val: '12 Day' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                                                <div className="text-lg font-black text-white mb-1">{stat.val}</div>
                                                <div className="text-[7px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual: Mock XP Card - Removed */}
                </div>
            </section>

            {/* --- CHAPTER 4: THE PEDIGREE (Community + Trust) --- */}
            <section id="community" className="py-24 md:py-48 px-4 md:px-8 max-w-7xl mx-auto border-t border-white/5">
                <div className="text-center mb-16 md:mb-32">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 md:mb-8 tracking-tighter uppercase">THE PEDIGREE</h2>
                    <p className="text-gray-500 text-base md:text-xl font-medium max-w-2xl mx-auto">Engineered for depth, not just data. A rigorous learning ecosystem built for high-stakes financial simulations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="glass-purple p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-center border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-purple-600/5 transition-all group-hover:bg-purple-600/10" />
                        <ShieldCheck className="w-20 h-20 md:w-32 md:h-32 text-purple-500/40 mx-auto mb-8 md:mb-10" />
                        <h4 className="text-2xl md:text-4xl font-black mb-4 uppercase">PROFESSIONAL RIGOR</h4>
                        <p className="text-gray-500 uppercase tracking-[0.3em] font-black text-[10px] md:text-xs">Simulating Real-World Engagements</p>
                    </div>
                    <div className="glass-purple p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-center border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-600/5 transition-all group-hover:bg-indigo-600/10" />
                        <Users className="w-20 h-20 md:w-32 md:h-32 text-indigo-500/40 mx-auto mb-8 md:mb-10" />
                        <h4 className="text-2xl md:text-4xl font-black mb-4 uppercase">GLOBAL STANDARDS</h4>
                        <p className="text-gray-500 uppercase tracking-[0.3em] font-black text-[10px] md:text-xs">A Unified Learning Ecosystem</p>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="pt-24 md:pt-48 pb-12 md:pb-16 px-4 md:px-8 border-t border-white/5 bg-[#070718]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between gap-16 md:gap-24 mb-16 md:mb-32">
                        <div className="max-w-sm">
                            <div className="flex items-center gap-3 mb-8 md:mb-10">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-lg md:rounded-xl flex items-center justify-center">
                                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <span className="text-lg md:text-xl font-bold">Finopoly</span>
                            </div>
                            <p className="text-gray-500 text-sm md:text-lg leading-relaxed font-medium">
                                The ultimate playground for financial masters. Chiseled in code, built for the elite.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-24">
                            <div>
                                <h5 className="font-black text-[10px] md:text-xs uppercase tracking-[0.4em] text-white mb-6 md:mb-10">Navigation</h5>
                                <ul className="space-y-4 md:space-y-6 text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <li><a href="#story" className="hover:text-purple-400 transition-colors">The Story</a></li>
                                    <li><a href="#arena" className="hover:text-purple-400 transition-colors">Audit Arena</a></li>
                                    <li><a href="#mastery" className="hover:text-purple-400 transition-colors">Tax Sandbox</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-black text-[10px] md:text-xs uppercase tracking-[0.4em] text-white mb-6 md:mb-10">Resources</h5>
                                <ul className="space-y-4 md:space-y-6 text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <li><a href="#" className="hover:text-purple-400 transition-colors">Methodology</a></li>
                                    <li><a href="#" className="hover:text-purple-400 transition-colors">Curriculum</a></li>
                                    <li><a href="#" className="hover:text-purple-400 transition-colors">Legal</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700 text-center md:text-left">
                            © 2024 FINOPOLY • BUILT FOR MASTERS
                        </div>
                        <div className="flex gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 hover:border-purple-500 transition-colors cursor-pointer" />
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
