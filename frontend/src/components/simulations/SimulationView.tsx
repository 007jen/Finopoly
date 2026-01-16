import React, { useState, useEffect, useRef, } from 'react';
import { Check, X, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { api } from '../../lib/api';
import InvoiceView from './InvoiceView';
import TallyAuditView from './TallyAuditView';
import { ChevronRight } from 'lucide-react';

// --- Types ---
type PaymentMode = 'CASH' | 'BANK' | 'UPI';

interface InvoiceData {
  vendor: string;
  invoiceNo: string;
  date: string;
  amount: number;
  tax: number;
  total: number;
  description: string;
  paymentMode: PaymentMode;
  gstin: string;
}

interface LedgerData {
  date: string;
  particulars: string;
  vchType: string;
  vchNo: string;
  debit: number | null;
  credit: number | null;
}

interface Level {
  id: number;
  companyName?: string;
  description?: string;
  invoice: InvoiceData;
  ledger: LedgerData;
  faultyField: string | null;
  violationReason?: string;
}

// --- Mock Data ---
const GAME_LEVELS: Level[] = [
  {
    id: 1,
    invoice: {
      vendor: "Bharat Electronics Ltd",
      invoiceNo: "BEL/24-25/089",
      date: "01-Apr-2024",
      amount: 45000,
      tax: 8100,
      total: 53100,
      gstin: "29AAAAA0000A1Z5",
      paymentMode: "BANK",
      description: "Industrial Components Purchase"
    },
    ledger: {
      date: "01-Apr-2024",
      particulars: "Bharat Electronics Ltd",
      vchNo: "1",
      vchType: "Purchase",
      debit: 53100,
      credit: 0
    },
    faultyField: null
  }
];

const MAX_TIME = 60.0;

interface SimulationViewProps {
  caseId: string;
  onBack: () => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ caseId, onBack }) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [gameState, setGameState] = useState<'PLAYING' | 'RESULT' | 'FINISHED' | 'GAME_OVER'>('PLAYING');
  const [result, setResult] = useState<'SUCCESS' | 'FAILURE' | null>(null);
  const [phase, setPhase] = useState<'BRIEF' | 'PLANNING' | 'SAMPLING' | 'TESTING' | 'REPORTING'>('BRIEF');
  const [materiality, setMateriality] = useState(10000);
  const [clientBriefData, setClientBriefData] = useState<any>(null);
  const [selectedSamples, setSelectedSamples] = useState<number[]>([]);
  const [foundErrors, setFoundErrors] = useState<number>(0);
  const [levels, setLevels] = useState<Level[]>(GAME_LEVELS);
  const [loading, setLoading] = useState(true);
  /* --- AZURE CLOUD START --- */
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  /* --- AZURE CLOUD END --- */

  const { getToken } = useClerkAuth();
  const { refreshUser } = useAuth();
  const isProcessingRef = useRef(false);

  /* --- AZURE CLOUD START --- */
  const handleAiScan = async () => {
    setIsScanning(true);
    try {
      // Send the real digital invoice data for semantic analysis
      const res = await api.analyzeInvoice(currentLevel.invoice) as any;

      if (res && res.explanation) {
        setScannedData(res.explanation);
        console.log("AI Analysis Result:", res.explanation);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setIsScanning(false);
    }
  };
  /* --- AZURE CLOUD END --- */

  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        let fetchedData: any[] = [];
        if (caseId) {
          const data = await api.get<any>(`/api/audit/playable/${caseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchedData = [data];
        } else {
          fetchedData = await api.get<any[]>(`/api/audit/playable?count=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }

        if (fetchedData.length > 0) {
          const primaryCase = fetchedData[0];
          if (primaryCase.vouchers && Array.isArray(primaryCase.vouchers)) {
            const mappedLevels: Level[] = primaryCase.vouchers.map((v: any, idx: number) => ({
              id: idx + 1,
              invoice: v.invoice,
              ledger: v.ledger,
              violationReason: v.violationReason,
              faultyField: v.faultyField,
              companyName: primaryCase.companyName
            }));
            setLevels(mappedLevels);
            if (primaryCase.clientBrief) setClientBriefData(primaryCase.clientBrief);
          } else {
            const mappedLevels: Level[] = fetchedData
              .filter((item: any) => item.invoiceDetails?.vendor || item.ledgerDetails?.particulars)
              .map((item: any, idx: number) => ({
                id: typeof item.id === 'number' ? item.id : (parseInt(item.id) || idx + 1),
                invoice: item.invoiceDetails,
                ledger: item.ledgerDetails,
                violationReason: item.violationReason,
                faultyField: item.faultyField || null,
                companyName: item.companyName
              }));
            setLevels(mappedLevels.length > 0 ? mappedLevels : GAME_LEVELS);
          }
        } else {
          setLevels(GAME_LEVELS);
        }
      } catch (err) {
        console.error("Error fetching game data", err);
        setLevels(GAME_LEVELS);
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();
  }, [caseId]);

  useEffect(() => {
    isProcessingRef.current = false;
  }, [currentLevelIdx]);

  const currentLevel = levels[currentLevelIdx % levels.length];

  const logAttempt = async (isSuccess: boolean, correctInc?: number, totalInc?: number) => {
    try {
      const token = await getToken();
      const res = await api.post<any>('/api/audit/complete', {
        caseId,
        score: isSuccess ? 100 : 0,
        success: isSuccess,
        correctIncrement: correctInc,
        totalIncrement: totalInc
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshUser();
      return res;
    } catch (error: any) {
      console.error("Error logging attempt:", error);
      return null;
    }
  };

  const triggerVictoryConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: ['#22c55e', '#eab308'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: ['#22c55e', '#eab308'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  useEffect(() => {
    if (gameState !== 'PLAYING' || !currentLevel || phase !== 'TESTING') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timer);
          setResult('FAILURE');
          currentLevel.violationReason = "Time's up! Audit incomplete.";
          setGameState('GAME_OVER');
          logAttempt(false, currentLevelIdx, currentLevelIdx + 1);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [gameState, currentLevel, phase]);

  const handleVoucherSubmit = async (userData: LedgerData) => {
    if (gameState !== 'PLAYING' || !currentLevel || isProcessingRef.current) return;
    isProcessingRef.current = true;

    let totalXpEarned = 0;
    const results = {
      date: userData.date.toLowerCase() === currentLevel.ledger.date.toLowerCase(),
      ledger: userData.particulars.toLowerCase() === currentLevel.ledger.particulars.toLowerCase(),
      amount: (userData.debit === currentLevel.ledger.debit) || (userData.credit === currentLevel.ledger.credit),
    };

    if (results.date) totalXpEarned += 10;
    if (results.ledger) totalXpEarned += 50;
    if (results.amount) totalXpEarned += 40;

    setScore(s => s + totalXpEarned);

    if (totalXpEarned >= 60) {
      setGameState('RESULT');
      setResult('SUCCESS');
      triggerVictoryConfetti();
      if (currentLevel.faultyField) setFoundErrors(prev => prev + 1);

      setTimeout(async () => {
        const currentSampleIdxInSelected = selectedSamples.indexOf(levels.indexOf(currentLevel));
        const hasNextSample = currentSampleIdxInSelected !== -1 && currentSampleIdxInSelected < selectedSamples.length - 1;

        if (!hasNextSample) {
          setPhase('REPORTING');
          setResult(null);
          setGameState('PLAYING');
        } else {
          setGameState('PLAYING');
          setResult(null);
          setTimeLeft(MAX_TIME);
          setCurrentLevelIdx(selectedSamples[currentSampleIdxInSelected + 1]);
        }
      }, 2000);
    } else {
      setResult('FAILURE');
      setGameState('GAME_OVER');
      currentLevel.violationReason = `Entry Invalid. Scored ${totalXpEarned}/100 XP. Errors in: ${!results.date ? 'Date, ' : ''}${!results.ledger ? 'Ledger, ' : ''}${!results.amount ? 'Values' : ''}`;
      logAttempt(false, totalXpEarned, 100);
    }
  };

  const handleOpinion = async (opinion: 'UNMODIFIED' | 'QUALIFIED' | 'ADVERSE') => {
    const totalFaultsInSubset = selectedSamples.filter(i => levels[i].faultyField !== null).length;
    let isCorrect = false;
    if (totalFaultsInSubset === 0 && opinion === 'UNMODIFIED') isCorrect = true;
    if (totalFaultsInSubset > 0 && totalFaultsInSubset < 3 && opinion === 'QUALIFIED') isCorrect = true;
    if (totalFaultsInSubset === 3 && opinion === 'ADVERSE') isCorrect = true;

    if (isCorrect) {
      setGameState('FINISHED');
      await logAttempt(true, 500, 500);
    } else {
      setResult('FAILURE');
      setGameState('GAME_OVER');
      currentLevel.violationReason = `Wrong Audit Opinion. There were ${totalFaultsInSubset} faults, and you issued ${opinion}.`;
      await logAttempt(false, 0, 500);
    }
  };

  const renderPhaseContent = () => {
    if (phase === 'BRIEF') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none"></div>

          <div className="max-w-2xl w-full bg-slate-800/80 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-white/10 shadow-2xl relative z-10">
            <div className="mb-6 sm:mb-8 relative inline-block">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-3xl"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                <Shield size={32} className="text-white drop-shadow-md sm:w-9 sm:h-9" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4 sm:mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              Audit Engagement
            </h1>

            <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-6 border border-white/5 mb-6 sm:mb-8">
              <p className="text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed">
                {clientBriefData?.context || `You are assigned to audit `}
                <span className="text-blue-400 font-bold">{currentLevel?.companyName || 'the client'}</span>
                {clientBriefData?.context ? '' : `. Your objective is to verify records and issue a professional opinion.`}
              </p>
            </div>

            <button
              onClick={() => setPhase('PLANNING')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 sm:py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] active:scale-[0.98] text-lg sm:text-xl tracking-widest uppercase border border-white/10 flex items-center justify-center gap-3 group"
            >
              Accept Assignment
              <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-6">
              Finopoly Assurance Standards • ISO 27001
            </p>
          </div>
        </div>
      );
    }

    if (phase === 'PLANNING') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-lg bg-yellow-500/5 rounded-full blur-[128px] pointer-events-none"></div>

          <div className="max-w-2xl w-full bg-slate-800/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 border border-white/10 shadow-2xl relative z-10 mx-auto">
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase mb-6 sm:mb-8 tracking-tight">
              Phase 1: <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Planning</span>
            </h1>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 sm:p-6 mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <p className="text-yellow-500 text-xs sm:text-sm font-black mb-2 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} /> Auditor's Note
              </p>
              <p className="text-slate-300 text-sm sm:text-base font-medium">Set your materiality threshold for this audit based on the company size.</p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              <label className="block text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">Materiality Threshold (₹)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xl">₹</span>
                <input
                  type="number"
                  value={materiality}
                  onChange={(e) => setMateriality(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border-2 border-slate-700/50 rounded-2xl py-4 pl-12 pr-6 text-white font-mono text-xl sm:text-2xl focus:border-yellow-500/50 focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(234,179,8,0.1)] outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setPhase('BRIEF')}
                className="order-2 sm:order-1 flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-xl transition-all uppercase tracking-wider text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setPhase('SAMPLING')}
                className="order-1 sm:order-2 flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-lg uppercase tracking-widest"
              >
                Save & Proceed
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (phase === 'SAMPLING') {
      return (
        <div className="min-h-screen bg-slate-900 p-4 sm:p-10 flex flex-col">
          <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8 flex-1">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Phase 2: <span className="text-blue-400">Sampling</span></h1>
                <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-md">Select transactions from the ledger below for detailed substantive testing.</p>
              </div>
              <div className="bg-slate-800/80 backdrop-blur-sm p-4 border border-slate-700 rounded-2xl flex flex-col items-end shadow-lg w-full sm:w-auto">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Materiality Threshold</p>
                <p className="text-yellow-500 font-mono font-bold text-xl sm:text-2xl drop-shadow-sm">₹{materiality.toLocaleString()}</p>
              </div>
            </header>

            <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl flex-1 flex flex-col">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left font-mono text-sm min-w-[600px]">
                  <thead className="bg-slate-900/50 text-slate-500 uppercase font-black border-b border-slate-700/50 text-[10px] sm:text-xs tracking-wider">
                    <tr>
                      <th className="p-4 sm:p-6">Date</th>
                      <th className="p-4 sm:p-6">Particulars</th>
                      <th className="p-4 sm:p-6 text-right">Debit (₹)</th>
                      <th className="p-4 sm:p-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 divide-y divide-slate-700/30">
                    {levels.map((lvl, idx) => (
                      <tr key={idx} className={`hover:bg-slate-700/30 transition-colors ${selectedSamples.includes(idx) ? 'bg-blue-500/5' : ''}`}>
                        <td className="p-4 sm:p-6">{lvl.ledger.date}</td>
                        <td className="p-4 sm:p-6 font-bold text-white">{lvl.ledger.particulars}</td>
                        <td className="p-4 sm:p-6 text-right font-medium">₹{lvl.ledger.debit?.toLocaleString()}</td>
                        <td className="p-4 sm:p-6 text-center">
                          <button
                            onClick={() => setSelectedSamples(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])}
                            className={`px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md ${selectedSamples.includes(idx) ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                          >
                            {selectedSamples.includes(idx) ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <button onClick={() => setPhase('PLANNING')} className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl transition-all uppercase tracking-wider text-sm">Back</button>
              <button
                disabled={selectedSamples.length === 0}
                onClick={() => { setCurrentLevelIdx(selectedSamples[0]); setPhase('TESTING'); }}
                className="w-full sm:w-auto px-10 sm:px-12 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 disabled:grayscale text-white font-black rounded-xl shadow-xl shadow-emerald-600/20 active:scale-95 uppercase tracking-widest text-sm sm:text-base flex items-center justify-center gap-2"
              >
                Commence Testing <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (phase === 'REPORTING') {
      const totalFaults = selectedSamples.filter(i => levels[i].faultyField !== null).length;
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full bg-slate-800/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-12 border border-slate-700/50 shadow-2xl my-auto">
            <header className="text-center mb-10 sm:mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/30">
                <Shield size={40} className="text-white drop-shadow-md" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-3">Final Phase: Audit Opinion</h1>
              <p className="text-slate-400 text-base sm:text-lg">Based on your testing, conclude the engagement.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
              {[
                { id: 'UNMODIFIED', label: 'Unmodified', desc: 'Financial statements are true and fair.', color: 'from-green-600 to-emerald-600', shadow: 'shadow-green-500/20' },
                { id: 'QUALIFIED', label: 'Qualified', desc: 'True & fair, except for specific misstatements.', color: 'from-yellow-500 to-amber-600', shadow: 'shadow-yellow-500/20' },
                { id: 'ADVERSE', label: 'Adverse', desc: 'Significant material misstatements detected.', color: 'from-red-600 to-rose-600', shadow: 'shadow-red-500/20' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleOpinion(opt.id as any)}
                  className="group relative p-6 sm:p-8 bg-slate-900 border border-slate-700 rounded-2xl text-center hover:border-transparent transition-all overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${opt.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 bg-white/10 rounded-xl mb-4 flex items-center justify-center mx-auto ring-1 ring-white/20 group-hover:bg-white/20 group-hover:scale-110 transition-all`}>
                      <Check size={24} className="text-white" />
                    </div>
                    <h3 className="text-white font-black text-lg sm:text-xl mb-2 uppercase tracking-tight">{opt.label}</h3>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium group-hover:text-white/80 transition-colors">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-dashed border-slate-700 max-w-lg mx-auto">
              <div className="flex justify-between items-center text-xs sm:text-sm mb-4">
                <span className="text-slate-500 uppercase font-black tracking-widest">Testing Summary</span>
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold text-xs">{selectedSamples.length} Vouchers</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800 rounded-xl p-4">
                <span className="text-slate-400 font-bold text-sm">Errors Detected</span>
                <span className="text-white font-mono font-bold text-xl">{foundErrors} <span className="text-slate-600 text-base">/ {totalFaults}</span></span>
              </div>
            </div>
          </div>
        </div>
      );
    }


    if (!currentLevel) return <div className="min-screen bg-slate-900"></div>;

    return (
      <div className="flex flex-col h-full bg-slate-900 text-white font-sans overflow-hidden">
        <header className="p-4 bg-slate-800 border-b-4 border-slate-700 flex justify-between items-center">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-1"><ArrowLeft size={16} /><span>EXIT</span></button>
            <h1 className="text-xl font-bold">{currentLevel.companyName}</h1>
          </div>
          <div className="flex gap-10">
            <div className="text-center"><p className="text-[10px] text-slate-500 uppercase">XP Score</p><p className="text-xl font-mono text-yellow-500">{score}</p></div>
            <div className="text-center font-mono text-red-500 border border-slate-700 px-4 py-1 rounded bg-slate-900">{Math.ceil(timeLeft)}s</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-32">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            <div className="overflow-x-auto rounded-3xl border border-slate-700 bg-slate-800 p-2 sm:p-4">
              <div className="min-w-[320px]">
                <InvoiceView data={currentLevel.invoice} />
              </div>
            </div>
            <div className="bg-slate-800 rounded-3xl p-2 sm:p-4 border border-slate-700 flex flex-col overflow-x-auto">
              <div className="min-w-[320px]">
                <TallyAuditView
                  ledger={currentLevel.ledger}
                  onSubmit={handleVoucherSubmit}
                  isSubmitting={gameState === 'RESULT'}
                  /* --- AZURE CLOUD START --- */
                  autoFillData={scannedData}
                /* --- AZURE CLOUD END --- */
                />
              </div>

              {/* --- AZURE CLOUD START (HIDDEN) --- */}
              {false && (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  {!scannedData ? (
                    <button
                      onClick={handleAiScan}
                      disabled={isScanning}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] group"
                    >
                      {isScanning ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Sparkles size={18} className="text-blue-200 group-hover:animate-pulse" />
                          <span className="uppercase tracking-widest">✨ Explain Audit</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-5 bg-blue-900/30 border border-blue-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                          <Sparkles size={14} />
                          <span>Audit Explanation</span>
                        </div>
                        <button
                          onClick={() => setScannedData(null)}
                          className="text-blue-400/50 hover:text-blue-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="text-xs text-blue-100 leading-relaxed italic whitespace-pre-wrap">
                        {(typeof scannedData === 'string' ? scannedData : (scannedData as any)?.explanation || '').replace(/\*\*/g, '')}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* --- AZURE CLOUD END --- */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Audit Data...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans overflow-hidden relative">
      {renderPhaseContent()}

      {/* GLOBAL OVERLAYS */}
      {result === 'SUCCESS' && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="bg-green-600 text-white px-12 py-6 rounded-2xl shadow-2xl transform -rotate-2 animate-bounce-in">
            <h2 className="text-4xl font-black uppercase">VERIFIED</h2>
          </div>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-red-900/95 backdrop-blur-md animate-in fade-in">
          <div className="text-center p-10 max-w-md w-full bg-slate-800 rounded-3xl border border-red-500/30">
            <X size={60} className="text-red-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-4 uppercase">Disallowed!</h2>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed">{currentLevel?.violationReason || "Audit failure detected."}</p>
            <button onClick={onBack} className="w-full py-4 bg-white text-red-900 rounded-xl font-black text-xl hover:bg-slate-200 transition-all">RETURN TO LOBBY</button>
          </div>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-green-900/95 backdrop-blur-md animate-in fade-in">
          <div className="text-center p-10 max-w-md w-full bg-slate-800 rounded-3xl border border-green-500/30">
            <Check size={60} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-4 uppercase">Promotion Secure!</h2>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed">You successfully verified the audit samples and issued a correct opinion.</p>
            <button onClick={onBack} className="w-full py-4 bg-white text-green-900 rounded-xl font-black text-xl hover:bg-slate-200 transition-all">RETURN TO LOBBY</button>
          </div>
        </div>
      )}

      {/* Azure logic ends above */}
    </div>
  );
};

export default SimulationView;