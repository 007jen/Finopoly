import React, { useEffect, useState } from 'react';
import {
    Shield, ArrowRight, Activity, Zap, Layers,
    Users, Scale, Code, Clock
} from 'lucide-react';
import { DeviceMockup } from './DeviceMockup';

const AnimatedCounter = ({ end, duration = 2000, suffix = "", prefix = "" }: { end: number, duration?: number, suffix?: string, prefix?: string }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const counterRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (counterRef.current) observer.observe(counterRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number | null = null;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return (
        <span ref={counterRef} className="font-mono tabular-nums">
            {prefix}{count}{suffix}
        </span>
    );
};


// --- TYPES ---
interface LandingPageProps {
    onGetStarted: () => void;
}

// --- VISUAL COMPONENTS ---

/**
 * 1. THE COMMAND CENTER (Hero Visual - X-RAY EDITION)
 */
const CommandCenterShowcase = () => {
    const [activeTab, setActiveTab] = useState<'audit' | 'drill' | 'quiz'>('audit');

    return (
        <div className="relative w-full max-w-6xl mx-auto perspective-1000 group my-16 md:my-24">

            {/* The Titan Device Mockup */}
            <DeviceMockup>
                {/* Browser/App Header (Inside the screen) */}
                <div className="h-10 bg-[#0f0f16] border-b border-white/5 flex items-center px-4 justify-between relative z-20">
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30"></div>
                    </div>

                    {/* View Switcher Tabs */}
                    <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'audit' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Audit
                        </button>
                        <button
                            onClick={() => setActiveTab('drill')}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'drill' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Drill
                        </button>
                        <button
                            onClick={() => setActiveTab('quiz')}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'quiz' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Quiz
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    </div>
                </div>

                {/* ACTIVE VIEW CONTAINER */}
                <div className="aspect-[16/9] md:aspect-[16/10] bg-[#f8fafc] relative overflow-hidden group/screen transition-all duration-300">
                    <div className="absolute inset-0">
                        {activeTab === 'audit' && (
                            <img
                                src="/assets/landing/audit.png"
                                alt="Audit Simulation Interface"
                                className="w-full h-full object-cover"
                            />
                        )}
                        {activeTab === 'drill' && (
                            <img
                                src="/assets/landing/drill.png"
                                alt="Drill Cockpit Interface"
                                className="w-full h-full object-cover"
                            />
                        )}
                        {activeTab === 'quiz' && (
                            <img
                                src="/assets/landing/quiz.png"
                                alt="Quiz Arena Interface"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Scanning Line Effect (Optional, reduced intensity for these UI mocks) */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-purple-500/30 z-30 animate-scan-beam opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

            </DeviceMockup>

            {/* Context Caption */}
            <div className="absolute -bottom-16 left-0 right-0 text-center transition-all duration-500">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Current Module</p>
                <div className="text-xl font-black text-white">
                    {activeTab === 'audit' && "Real-World Audit Validation"}
                    {activeTab === 'drill' && "Performance & Accuracy Tracker"}
                    {activeTab === 'quiz' && "Rapid-Fire Concept Testing"}
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#070718] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                @keyframes scan-beam { 
                    0% { top: 0%; opacity: 0; }
                    5% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes scan-beam-trail {
                    0% { top: -100px; opacity: 0; }
                    5% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: calc(100% - 100px); opacity: 0; }
                }
                @keyframes scan-reveal {
                    0% { clip-path: inset(0 0 100% 0); }
                    100% { clip-path: inset(0 0 0 0); }
                }
                .animate-float-slow { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float 6s ease-in-out infinite 3s; }
                .animate-scan { animation: scan 3s linear infinite; }
                .animate-scan-beam { animation: scan-beam 4s ease-in-out infinite; }
                .animate-scan-beam-trail { animation: scan-beam-trail 4s ease-in-out infinite; }
                .animate-scan-reveal { animation: scan-reveal 4s ease-in-out infinite; }
                .perspective-1000 { perspective: 1000px; }
                .rotate-x-12 { transform: rotateX(12deg) scale(0.95); }
                .glass-panel {
                    background: rgba(20, 20, 30, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                .text-gradient {
                    background: linear-gradient(to bottom, #fff 30%, #a78bfa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>

            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-[#070718]/90 backdrop-blur-md border-b border-white/5 py-4' : 'py-6 border-b border-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Finopoly</span>
                    </div>
                    <div className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {['The Story', 'The Arena', 'Mastery', 'Pedigree'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-purple-400 transition-colors">{item}</a>
                        ))}
                    </div>
                    <button onClick={onGetStarted} className="px-6 py-2 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Enter Arena
                    </button>
                </div>
            </nav>

            {/* --- HERO: THE GRIND --- */}
            <section id="the-story" className="relative pt-32 md:pt-48 pb-20 px-4 overflow-hidden">
                {/* Background FX */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 animate-fade-in">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            System Online
                        </div> */}

                    <h1 className="text-5xl md:text-8xl lg:text-[100px] font-black leading-[0.9] tracking-tighter mb-8 text-gradient">
                        FINANCIAL <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400"><br />SIMULATOR</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        The definitive simulator for financial mastery.
                        We didn't just build a learning platform; we engineered an arena
                        where only the sharpest survive the ledger.
                    </p>

                    {/* --- STATS SECTION (Moved) --- */}
                    <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 relative z-10 w-full">
                        {/* Stat 1 */}
                        <div className="p-4 md:p-6 rounded-3xl bg-[#0b0b10]/80 backdrop-blur-sm border border-white/5 hover:border-purple-500/30 transition-all group">
                            <Code className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mb-3 group-hover:scale-110 transition-transform mx-auto" />
                            <div className="text-2xl md:text-3xl font-black text-white mb-1">
                                <AnimatedCounter end={1000} suffix="K+" />
                            </div>
                            <div className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lines Written</div>
                        </div>

                        {/* Stat 2 */}
                        <div className="p-4 md:p-6 rounded-3xl bg-[#0b0b10]/80 backdrop-blur-sm border border-white/5 hover:border-purple-500/30 transition-all group">
                            <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mb-3 group-hover:scale-110 transition-transform mx-auto" />
                            <div className="text-2xl md:text-3xl font-black text-white mb-1">
                                <AnimatedCounter end={80} suffix="+" />
                            </div>
                            <div className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hours Spent</div>
                        </div>

                        {/* Stat 3 */}
                        <div className="p-4 md:p-6 rounded-3xl bg-[#0b0b10]/80 backdrop-blur-sm border border-white/5 hover:border-purple-500/30 transition-all group">
                            <Layers className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mb-3 group-hover:scale-110 transition-transform mx-auto" />
                            <div className="text-2xl md:text-3xl font-black text-white mb-1">
                                <AnimatedCounter end={6} prefix="0" />
                            </div>
                            <div className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Modules</div>
                        </div>

                        {/* Stat 4 */}
                        <div className="p-4 md:p-6 rounded-3xl bg-[#0b0b10]/80 backdrop-blur-sm border border-white/5 hover:border-purple-500/30 transition-all group">
                            <Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mb-3 group-hover:scale-110 transition-transform mx-auto" />
                            <div className="text-2xl md:text-3xl font-black text-white mb-1">
                                <AnimatedCounter end={150} suffix="+" />
                            </div>
                            <div className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Simulations</div>
                        </div>
                    </div>

                    {/* THE NEW VISUAL COMPONENT */}
                    <CommandCenterShowcase />

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
                        <button onClick={onGetStarted} className="group relative px-8 py-4 bg-purple-600 rounded-xl overflow-hidden font-black uppercase tracking-widest text-sm shadow-[0_10px_40px_-10px_rgba(147,51,234,0.5)]">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative flex items-center gap-3">
                                Start Your Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-purple-500" /> v4.0 Stable</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-indigo-500" /> Multi-Player</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES: THE ARENA (X-Ray Modules) --- */}
            <section id="the-arena" className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-24 md:flex items-end justify-between border-b border-white/10 pb-8">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">The Arena</h2>
                            <p className="text-gray-400 max-w-md">Don't just read about finance. Manipulate it. Three modules designed to simulate high-pressure corporate environments.</p>
                        </div>
                        <div className="hidden md:block text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1">System Status</div>
                            <div className="text-2xl font-mono text-white">ALL SYSTEMS GO</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Module 1: X-Ray View */}
                        <div className="col-span-1 md:col-span-2 glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                            <div className="relative z-10">
                                <Activity className="w-12 h-12 text-purple-500 mb-6" />
                                <h3 className="text-3xl font-black uppercase mb-4">Audit Simulator</h3>
                                <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
                                    Verify 150+ real-world assertions. Use our proprietary "X-Ray" tool to scan ledgers for anomalies, fraud, and compliance risks.
                                </p>

                                {/* Mini-UI: Live Log */}
                                {/* Detailed Info Flood */}
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/10 pt-6">
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">01. Data Ingestion</div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                            Import raw financial datasets (Ledgers, Trial Balances, Invoices) directly into the simulation environment.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">02. Automated Testing</div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                            Run pre-configured substantive procedures to detect anomalies, variances, and potential fraud indicators instantly.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">03. Documentation</div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                            Flag audit exceptions and draft workpapers. Link evidence to assertions and generate a comprehensive audit trail.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">04. Review & Finalize</div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                            Submit findings for simulated partner review. Address review notes and issue the final audit opinion.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Background Graphic */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-purple-600/10 to-transparent rounded-full blur-[80px] group-hover:bg-purple-600/20 transition-colors"></div>
                        </div>

                        {/* Module 2: Vertical Card */}
                        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-colors flex flex-col justify-between">
                            <div>
                                <Zap className="w-10 h-10 text-indigo-400 mb-6" />
                                <h3 className="text-2xl font-black uppercase mb-4">Tax </h3>
                                <p className="text-gray-400 text-xs mb-8">
                                    Corporate Tax + VAT Simulations. Calculate liability in real-time environments.
                                </p>
                            </div>

                            {/* Mini-UI: Progress */}
                            {/* Detailed Info Flood */}
                            <div className="mt-8 space-y-6 border-t border-white/10 pt-6">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Scenario Modeling</div>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                        Input transaction variables to simulate complex tax events. Calculate TDS, GST, and Income Tax liabilities across multiple fiscal periods.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Compliance Checks</div>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                        Validate returns against statutory deadlines (forms 26Q, GSTR-1, GSTR-3B). Identify non-compliance risks before they become penalties.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Module 3: Gamification */}
                        <div className="md:col-span-3 glass-panel rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 hover:border-yellow-500/30 transition-colors group">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <Scale className="w-8 h-8 text-yellow-500" />
                                    <span className="text-xs font-black uppercase tracking-widest text-yellow-500/80">Regulatory Insight</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-black uppercase mb-6 leading-[0.9]">Master <br /> Case Laws</h3>
                                <p className="text-gray-400 max-w-lg">
                                    Navigate complex legal precedents. Study real-world financial litigations and court rulings to understand the regulatory boundaries of corporate finance.
                                </p>
                            </div>

                            {/* 3D Floating Rank Card */}
                            {/* Detailed Info Flood */}
                            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 border-l border-white/10 pl-8 md:ml-12">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Precedent Analysis</div>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                        Deep-dive into landmark judgments (Supreme Court, High Courts, ITAT). Dissect the legal rationale and understand the "ratio decidendi" behind every ruling.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Litigation Strategy</div>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                        Formulate defense strategies for hypothetical tax notices. Learn to draft appeal submissions and leverage case laws to substantiate your position.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Regulatory Updates</div>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                        Stay ahead of the curve with real-time updates on amendments, circulars, and notifications from regulatory bodies (CBDT, MCA, ICAI).
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Practical Application</div>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                        Apply legal principles to solve complex business scenarios. Bridge the gap between theoretical knowledge and practical advisory.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* --- PEDIGREE: TRUST & FOOTER --- */}
            < footer id="pedigree" className="bg-[#05050f] pt-32 pb-12 border-t border-white/5" >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xl font-bold">Finopoly</span>
                            </div>
                            <h4 className="text-4xl font-black uppercase tracking-tighter mb-6">Engineered for <br /> Masters.</h4>
                            <p className="text-gray-500 max-w-sm">
                                Built on Ind AS 115 Standards. Blockchain-verified integrity.
                                The chosen tool for the next generation of CFOs.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8">Platform</h5>
                                <ul className="space-y-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    <li className="hover:text-purple-400 cursor-pointer transition-colors">Audit Arena</li>
                                    <li className="hover:text-purple-400 cursor-pointer transition-colors">Tax Sandbox</li>
                                    <li className="hover:text-purple-400 cursor-pointer transition-colors">Leaderboard</li>
                                    <li className="hover:text-purple-400 cursor-pointer transition-colors">Changelog</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8">Company</h5>
                                <ul className="space-y-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    <li className="hover:text-purple-400 cursor-pointer transition-colors">The Story</li>
                                    <li className="hover:text-purple-400 cursor-pointer transition-colors">Manifesto</li>
                                    <li className="hover:text-purple-400 cursor-pointer transition-colors">Contact</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">
                            © 2024 Finopoly Systems
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="text-[10px] font-mono text-gray-500">SYSTEM STATUS: OPTIMAL</div>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    );
};

export default LandingPage;