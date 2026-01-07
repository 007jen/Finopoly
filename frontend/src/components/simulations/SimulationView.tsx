import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Flame, ShieldAlert, ArrowLeft, Shield, Target } from 'lucide-react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { api } from '../../lib/api';
import InvoiceView from './InvoiceView';
import TallyAuditView from './TallyAuditView';

// --- Types ---
type PaymentMode = 'CASH' | 'BANK' | 'UPI';
type AuditField = 'Vendor' | 'Date' | 'Amount' | 'Tax' | 'Compliance';

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
  },
  {
    id: 2,
    invoice: {
      vendor: "Swift Logistics",
      invoiceNo: "SL-992",
      date: "02-Apr-2024",
      amount: 8000,
      tax: 1440,
      total: 9440,
      gstin: "27BBBBB1111B1Z2",
      paymentMode: "CASH",
      description: "Freight Charges"
    },
    ledger: {
      date: "02-Apr-2024",
      particulars: "Swift Logistics",
      vchNo: "2",
      vchType: "Payment",
      debit: 9440,
      credit: 0
    },
    faultyField: null
  },
  {
    id: 3,
    invoice: {
      vendor: "Vertex Solutions",
      invoiceNo: "VS/INV/44",
      date: "04-Apr-2024",
      amount: 15000,
      tax: 2700,
      total: 17700,
      gstin: "19CCCCC2222C1Z8",
      paymentMode: "UPI",
      description: "Software Subscription"
    },
    ledger: {
      date: "04-Apr-2024",
      particulars: "Vertex Solutions",
      vchNo: "3",
      vchType: "Purchase",
      debit: 17700,
      credit: 0
    },
    faultyField: "Amount"
  },
  {
    id: 4,
    invoice: {
      vendor: "Reliable Stationery",
      invoiceNo: "RS-881",
      date: "05-Apr-2024",
      amount: 2500,
      tax: 0,
      total: 2500,
      gstin: "URD-NON-GST",
      paymentMode: "CASH",
      description: "Office Supplies"
    },
    ledger: {
      date: "05-Apr-2024",
      particulars: "Reliable Stationery",
      vchNo: "4",
      vchType: "Contra",
      debit: 2500,
      credit: 0
    },
    faultyField: null
  },
  {
    id: 5,
    invoice: {
      vendor: "Global Tech Corp",
      invoiceNo: "GTC-001",
      date: "07-Apr-2024",
      amount: 120000,
      tax: 21600,
      total: 141600,
      gstin: "08DDDDD3333D1Z0",
      paymentMode: "BANK",
      description: "Server Hardware"
    },
    ledger: {
      date: "07-Apr-2024",
      particulars: "Global Tech Corp",
      vchNo: "5",
      vchType: "Purchase",
      debit: 141600,
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
  // Game State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [gameState, setGameState] = useState<'PLAYING' | 'RESULT' | 'FINISHED' | 'GAME_OVER'>('PLAYING');
  const [result, setResult] = useState<'SUCCESS' | 'FAILURE' | null>(null);
  const [phase, setPhase] = useState<'BRIEF' | 'PLANNING' | 'SAMPLING' | 'TESTING' | 'REPORTING'>('BRIEF');
  const [materiality, setMateriality] = useState(10000);
  const [clientBriefData, setClientBriefData] = useState<any>(null);
  const [selectedSamples, setSelectedSamples] = useState<number[]>([]);
  const [foundErrors, setFoundErrors] = useState<number>(0);

  // For Debugging / Tracking
  useEffect(() => {
    if (foundErrors > 0) console.log(`Current caught mistakes: ${foundErrors}`);
  }, [foundErrors]);

  // Animation State

  // CHECKLIST STATE
  const [auditStep, setAuditStep] = useState(0);
  const [auditOrder, setAuditOrder] = useState<AuditField[]>([]);
  // We don't really need a full record of selections if we are replacing them, 
  // but it might be useful for tracking what happened.

  const AUDIT_FIELDS: AuditField[] = ['Vendor', 'Date', 'Amount', 'Tax', 'Compliance'];

  // DYNAMIC DATA
  const [levels, setLevels] = useState<Level[]>(GAME_LEVELS);
  const [loading, setLoading] = useState(true);
  const { getToken } = useClerkAuth();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        let fetchedData: any[] = [];

        if (caseId) {
          // Fetch specific case (Single Play)
          const data = await api.get<any>(`/api/audit/playable/${caseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchedData = [data];
        } else {
          // Fetch random set (Challenge Mode)
          fetchedData = await api.get<any[]>(`/api/audit/playable?count=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }

        if (fetchedData.length > 0) {
          // Transform Data (Only if it looks valid)
          const primaryCase = fetchedData[0]; // Assuming fetchedData contains at least one case

          if (primaryCase.vouchers && Array.isArray(primaryCase.vouchers)) {
            // Use the handcrafted voucher pool
            const mappedLevels: Level[] = primaryCase.vouchers.map((v: any, idx: number) => ({
              id: idx + 1,
              // These fields might be on the primaryCase or the voucher itself, adjust as needed
              // For now, assuming they are on the primaryCase for context
              // title: primaryCase.title, 
              // companyName: primaryCase.companyName,
              // difficulty: primaryCase.difficulty,
              // description: primaryCase.description,
              invoice: v.invoice,
              ledger: v.ledger,
              // expectedAction: v.expectedAction, // Not part of Level interface
              violationReason: v.violationReason,
              faultyField: v.faultyField,
              // tags: primaryCase.tags // Not part of Level interface
            }));
            setLevels(mappedLevels);

            // Set basic info if BRIEF phase needs it
            if (primaryCase.clientBrief) {
              setClientBriefData(primaryCase.clientBrief);
              setMateriality(primaryCase.clientBrief.industry === 'MANUFACTURING' ? 15000 : 10000); // Default or derive
            }
          } else {
            // Legacy / Dynamic shuffling logic
            const mappedLevels: Level[] = fetchedData
              .filter((item: any) => item.invoiceDetails?.vendor || item.ledgerDetails?.particulars)
              .map((item: any, idx: number) => ({
                id: typeof item.id === 'number' ? item.id : (parseInt(item.id) || idx + 1),
                // title: item.title, // Not part of Level interface
                // companyName: item.companyName, // Not part of Level interface
                // difficulty: item.difficulty, // Not part of Level interface
                // description: item.description, // Not part of Level interface
                invoice: item.invoiceDetails,
                ledger: item.ledgerDetails,
                // expectedAction: item.expectedAction, // Not part of Level interface
                violationReason: item.violationReason,
                faultyField: item.faultyField || null,
                // tags: item.tags || [] // Not part of Level interface
              }));
            if (mappedLevels.length > 0) {
              setLevels(mappedLevels);
            } else {
              setLevels(GAME_LEVELS);
            }
          }
        } else {
          // Fallback to MOCK if API returns empty (e.g. dev env)
          console.warn("API returned no stats, using mock.");
          setLevels(GAME_LEVELS);
        }

      } catch (err) {
        console.error("Error fetching game data", err);
        setLevels(GAME_LEVELS); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [caseId]);

  useEffect(() => {
    // 1. Shuffle Fields for Randomness every time level changes
    const shuffled = [...AUDIT_FIELDS].sort(() => Math.random() - 0.5);
    setAuditOrder(shuffled);

    // 2. Reset Step
    setAuditStep(0);
  }, [currentLevelIdx]);

  useEffect(() => {
    // Component mounted
  }, []);

  const currentLevel = levels[currentLevelIdx % levels.length];

  // Ref for debouncing level completion
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Reset processing lock when level changes
    isProcessingRef.current = false;
  }, [currentLevelIdx]);

  // Helper Functions
  const logAttempt = async (isSuccess: boolean, correctInc?: number, totalInc?: number) => {
    try {
      const token = await getToken();
      console.log(`[XP-FRONTEND] Logging attempt for case: ${caseId}, success: ${isSuccess}`);
      const res = await api.post<any>('/api/audit/complete', {
        caseId,
        score: isSuccess ? 100 : 0,
        success: isSuccess,
        correctIncrement: correctInc,
        totalIncrement: totalInc
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("[XP-FRONTEND] Response from server:", res);

      if (res.alreadyRecorded) {
        console.warn("[XP-FRONTEND] Duplicate prevented by server.");
      } else {
        console.log(`[XP-FRONTEND] XP Awarded! New Total: ${res.totalXp}`);
        refreshUser();
      }
      return res;
    } catch (error: any) {
      console.error("[XP-FRONTEND] FATAL ERROR logging activity:", error);
      return null;
    }
  };

  const triggerVictoryConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#22c55e', '#eab308'] // Green and Yellow
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#22c55e', '#eab308']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // handleLevelComplete removed in favor of handleVoucherSubmit

  // Timer Logic
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (!currentLevel) return; // Add safety check inside hook

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timer);
          // Timeout is an automatic failure
          setResult('FAILURE');
          if (currentLevel) currentLevel.violationReason = "Time's up! Audit incomplete.";
          setGameState('GAME_OVER');
          logAttempt(false, currentLevelIdx, currentLevelIdx + 1); // Log failure to backend
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState, currentLevel]);


  const handleVoucherSubmit = async (userData: LedgerData) => {
    if (gameState !== 'PLAYING' || !currentLevel || isProcessingRef.current) return;
    isProcessingRef.current = true;

    // SCORING ENGINE (Partial XP)
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

      // Check if this level had a hidden fault and we "passed" it correctly
      if (currentLevel.faultyField) {
        setFoundErrors(prev => prev + 1);
      }

      setTimeout(async () => {
        const currentSampleIdxInSelected = selectedSamples.indexOf(levels.indexOf(currentLevel));
        const hasNextSample = currentSampleIdxInSelected !== -1 && currentSampleIdxInSelected < selectedSamples.length - 1;

        if (!hasNextSample) {
          setPhase('REPORTING');
          setResult(null);
          setGameState('PLAYING'); // Active for the report screen
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
      currentLevel.violationReason = `Entry Invalid. Scored ${totalXpEarned}/100 XP. Needs 60+ to pass. Errors in: ${!results.date ? 'Date, ' : ''}${!results.ledger ? 'Ledger, ' : ''}${!results.amount ? 'Values' : ''}`;
      logAttempt(false, totalXpEarned, 100);
    }
  };


  if (loading) return <div className="text-white">Loading...</div>;

  if (phase === 'BRIEF') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="max-w-2xl w-full bg-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-500 my-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-blue-600/20">
            <Shield size={32} className="text-white md:hidden" />
            <Shield size={40} className="text-white hidden md:block" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase tracking-tighter leading-tight">
            Client Profile: {levels[0]?.companyName || 'Swastik Enterprises'}
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] md:text-xs font-bold mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            INDUSTRY: {clientBriefData?.industry?.toUpperCase() || 'MANUFACTURING'}
          </div>

          <div className="space-y-4 md:space-y-6 text-slate-400 text-sm md:text-base leading-relaxed mb-8 md:mb-10">
            <p>
              {levels[0]?.description || 'Swastik Enterprises is a leading manufacturer of specialized industrial components. They have recently scaled operations.'}
            </p>
            <p className="bg-slate-900/50 p-4 rounded-xl border-l-4 border-blue-500">
              <span className="text-blue-400 font-bold block mb-1">AUDIT FOCUS:</span>
              {clientBriefData?.auditFocus || 'Your firm has been engaged for a Statutory Audit. We need to verify that all high-value purchases are correctly recorded.'}
            </p>
          </div>

          <button
            onClick={() => setPhase('PLANNING')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-sm md:text-base"
          >
            START PLANNING PHASE
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'PLANNING') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="max-w-2xl w-full bg-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-right-10 duration-500 my-8">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <Target size={28} className="text-yellow-500 md:hidden" />
            <Target size={32} className="text-yellow-500 hidden md:block" />
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Audit Planning: Materiality</h1>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
            <p className="text-yellow-500 text-[10px] md:text-sm font-bold mb-2 uppercase tracking-widest">Auditor's Note</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              {clientBriefData?.materialityGuidance || 'Materiality is a threshold. Errors above this limit are considered "Material" and could influence economic decisions.'}
            </p>
          </div>

          <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
            <label className="block text-slate-400 font-bold text-[10px] md:text-sm uppercase">Set Materiality Threshold (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                value={materiality}
                onChange={(e) => setMateriality(parseInt(e.target.value))}
                className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl py-3 md:py-4 pl-8 pr-4 text-white font-mono text-lg md:text-xl focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button
              onClick={() => setPhase('BRIEF')}
              className="w-full sm:flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 md:py-4 rounded-xl transition-all active:scale-95 text-sm md:text-base"
            >
              BACK
            </button>
            <button
              onClick={() => setPhase('SAMPLING')}
              className="w-full sm:flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black py-3 md:py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-sm md:text-base"
            >
              SAVE & PROCEED
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'SAMPLING') {
    return (
      <div className="min-h-screen bg-slate-900 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8 py-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight">Audit Phase: Sampling</h1>
              <p className="text-slate-400 text-sm mt-2">Select 1 high-risk transaction from the Day Book to perform detailed testing.</p>
            </div>
            <div className="flex gap-3 md:gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none bg-slate-800 p-3 md:p-4 border border-slate-700 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-black">Materiality</p>
                <p className="text-yellow-500 font-mono font-bold text-sm md:text-base">₹{materiality.toLocaleString()}</p>
              </div>
              <div className="flex-1 md:flex-none bg-slate-800 p-3 md:p-4 border border-slate-700 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-black">Selected</p>
                <p className="text-blue-400 font-mono font-bold text-sm md:text-base">{selectedSamples.length} / 1</p>
              </div>
            </div>
          </header>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-500 uppercase font-black border-b border-slate-700">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Particulars</th>
                  <th className="p-4">Vch No.</th>
                  <th className="p-4 text-right">Debit (₹)</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {levels.map((lvl, idx) => {
                  const isSelected = selectedSamples.includes(idx);
                  const isAboveMateriality = (lvl.ledger.debit || 0) >= materiality;

                  return (
                    <tr key={idx} className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${isSelected ? 'bg-blue-600/10' : ''}`}>
                      <td className="p-4">{lvl.ledger.date}</td>
                      <td className="p-4 font-bold">{lvl.ledger.particulars}</td>
                      <td className="p-4 text-slate-500">#{lvl.ledger.vchNo}</td>
                      <td className={`p-4 text-right font-bold ${isAboveMateriality ? 'text-orange-400' : ''}`}>
                        {lvl.ledger.debit?.toLocaleString() || '0.00'}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSamples(prev => prev.filter(i => i !== idx));
                            } else if (selectedSamples.length < 1) {
                              setSelectedSamples(prev => [...prev, idx]);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-bold transition-all ${isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-400 hover:text-white'
                            }`}
                        >
                          {isSelected ? 'SELECTED' : 'SELECT'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden space-y-4">
            {levels.map((lvl, idx) => {
              const isSelected = selectedSamples.includes(idx);
              const isAboveMateriality = (lvl.ledger.debit || 0) >= materiality;

              return (
                <div
                  key={idx}
                  className={`p-4 bg-slate-800 rounded-2xl border-2 transition-all ${isSelected ? 'border-blue-600 shadow-lg shadow-blue-600/10' : 'border-slate-700'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono mb-1">{lvl.ledger.date}</p>
                      <h4 className="text-sm font-black text-white uppercase">{lvl.ledger.particulars}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">VCH: #{lvl.ledger.vchNo}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-black font-mono ${isAboveMateriality ? 'text-orange-400' : 'text-slate-300'}`}>
                        ₹{lvl.ledger.debit?.toLocaleString() || '0.00'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSamples(prev => prev.filter(i => i !== idx));
                      } else if (selectedSamples.length < 1) {
                        setSelectedSamples(prev => [...prev, idx]);
                      }
                    }}
                    className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                      }`}
                  >
                    {isSelected ? 'SELECTED' : 'SELECT TRANSACTION'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <button
              onClick={() => setPhase('PLANNING')}
              className="px-8 py-4 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 hover:text-white transition-all text-sm sm:text-base"
            >
              BACK TO PLANNING
            </button>
            <button
              disabled={selectedSamples.length < 1}
              onClick={() => {
                setCurrentLevelIdx(selectedSamples[0]);
                setPhase('TESTING');
              }}
              className={`px-12 py-4 font-black rounded-xl transition-all shadow-xl active:scale-95 text-sm sm:text-base ${selectedSamples.length === 1
                ? 'bg-green-600 text-white shadow-green-600/20 hover:bg-green-500'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
            >
              COMMENCE TESTING
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'REPORTING') {
    const totalFaultsInSubset = selectedSamples.filter(i => levels[i].faultyField !== null).length;

    const handleOpinion = async (opinion: 'UNMODIFIED' | 'QUALIFIED' | 'ADVERSE') => {
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
        levels[currentLevelIdx].violationReason = `Wrong Audit Opinion. There were ${totalFaultsInSubset} faulty vouchers in your sample, but you issued a ${opinion} opinion. You caught ${foundErrors} mistakes during testing.`;
        await logAttempt(false, 0, 500);
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl w-full bg-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl animate-in zoom-in duration-500 my-8">
          <header className="text-center mb-8 md:mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 show-lg shadow-blue-600/20">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Final Phase: Audit Opinion</h1>
            <p className="text-slate-400 text-sm md:text-base mt-2">Based on your testing, what is your professional conclusion?</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            {[
              { id: 'UNMODIFIED', label: 'Unmodified', desc: 'Books are true and fair. No material errors.', color: 'bg-green-600' },
              { id: 'QUALIFIED', label: 'Qualified', desc: 'True & fair, except for specific items found.', color: 'bg-yellow-600' },
              { id: 'ADVERSE', label: 'Adverse', desc: 'Significant fraud or pervasive errors detected.', color: 'bg-red-600' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => handleOpinion(opt.id as any)}
                className="group p-5 md:p-6 bg-slate-900 border border-slate-700 rounded-2xl text-left sm:text-center hover:border-blue-500 transition-all active:scale-95"
              >
                <div className={`w-10 h-10 ${opt.color} rounded-lg mb-4 flex items-center justify-center mx-3 sm:mx-auto`}>
                  <Check size={20} className="text-white" />
                </div>
                <h3 className="text-white font-bold text-sm md:text-lg mb-1 md:mb-2">{opt.label}</h3>
                <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-dashed border-slate-700">
            <h4 className="text-[10px] text-slate-500 uppercase font-black mb-4">Testing Summary</h4>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Samples Tested</span>
              <span className="text-white font-mono">01</span>
            </div>
            <div className="flex justify-between text-sm mt-2 border-t border-slate-700/50 pt-2">
              <span className="text-slate-400">Mistakes Caught in Sample</span>
              <span className="text-blue-400 font-mono">{foundErrors} / {totalFaultsInSubset}</span>
            </div>
            <div className="flex justify-between text-sm mt-2 border-t border-slate-700/50 pt-2">
              <span className="text-slate-400">Materiality Limit Set</span>
              <span className="text-yellow-500 font-mono">₹{materiality.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLevel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center p-8 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
          <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Simulation Data Not Found</h2>
          <p className="text-slate-400 mb-6">Could not load the audit case. Please try again.</p>
          <button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans overflow-hidden relative">

      {/* 1. HEADER (Fixed) */}
      <div className="flex-none p-3 md:p-4 bg-slate-800 border-b-4 border-slate-700 shadow-lg z-20 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full text-center md:text-left">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Exit Audit</span>
            </button>
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
              <h1 className="text-base md:text-xl font-bold text-slate-200 leading-tight truncate">Mehta & Co. Accountants</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1 md:mt-0">
                <p className="text-[10px] md:text-sm text-slate-400">Swastik Enterprises</p>
                <span className="text-slate-600 hidden md:inline">•</span>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                  Sample {selectedSamples.indexOf(levels.indexOf(currentLevel)) + 1} / {selectedSamples.length}
                </p>
              </div>
            </div>
          </div>

          {/* TIMER - Sticky/Center for focus */}
          <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={`px-4 py-1.5 rounded-lg font-mono font-bold text-sm transition-colors duration-300 shadow-inner ${timeLeft < 5 ? 'bg-red-600 animate-pulse' : 'bg-slate-900 border border-slate-700 text-red-500'}`}>
              {Math.ceil(timeLeft)}s
            </div>
          </div>

          {/* MOBILE TIMER */}
          <div className="sm:hidden w-full bg-slate-900 rounded-lg p-2 border border-slate-700 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-black uppercase">Time Remaining</span>
            <span className={`font-mono font-bold ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{Math.ceil(timeLeft)}s</span>
          </div>

          {/* STATS */}
          <div className="flex gap-4 md:gap-6 items-center flex-1 justify-center md:justify-end w-full">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase">XP Score</p>
              <p className="text-lg md:text-xl font-mono font-bold text-yellow-500">{score.toLocaleString()}</p>
            </div>
            <div className="text-center hidden sm:block border-l border-slate-700 pl-4 md:pl-6">
              <p className="text-[10px] text-slate-400 uppercase">Streak</p>
              <div className="flex items-center gap-1 justify-center text-orange-500 font-bold text-lg">
                <Flame size={18} fill="currentColor" />
                <span>x{streak}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-40 md:pb-24 scroll-smooth">
        <div className="max-w-[1500px] mx-auto space-y-6">

          {/* DOCUMENT AREA - Refined Dual View */}
          <div className="flex flex-col xl:flex-row gap-6 items-stretch min-h-0 xl:min-h-[750px] transition-all duration-500">
            {/* LEFT PANEL: SOURCE DOCUMENT (INVOICE) */}
            <div className="flex-1 w-full xl:w-1/2 overflow-hidden hover:shadow-2xl transition-shadow xl:scale-[1.005] xl:hover:scale-[1.01] duration-300">
              <div className="h-full bg-slate-800/50 rounded-2xl p-2 md:p-4 border border-slate-700/50">
                <InvoiceView data={currentLevel.invoice} />
              </div>
            </div>

            {/* RIGHT PANEL: ACCOUNTING RECORD (INTERACTIVE TALLY) */}
            <div className="flex-1 w-full xl:w-1/2 overflow-hidden hover:shadow-2xl transition-shadow xl:scale-[1.005] xl:hover:scale-[1.01] duration-300">
              <div className="h-full bg-slate-800/50 rounded-2xl p-2 md:p-4 border border-slate-700/50">
                <TallyAuditView
                  ledger={currentLevel.ledger}
                  onSubmit={handleVoucherSubmit}
                  isSubmitting={gameState === 'RESULT'}
                />
              </div>
            </div>
          </div>

          <div className="h-8 md:h-0"></div> {/* Extra spacer for mobile scroll */}
        </div>
      </div>

      {/* 3. INSTRUCTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-700 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] z-50 p-4">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
              <Shield size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] md:text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">Mission</p>
              <h3 className="text-white font-bold text-xs md:text-sm truncate leading-tight">Transfer invoice details into the Tally Voucher Entry system</h3>
            </div>
          </div>

          <div className="flex gap-6 md:gap-10 w-full sm:w-auto justify-center sm:justify-end border-t border-slate-800 pt-3 sm:pt-0 sm:border-0">
            <div className="text-center">
              <p className="text-[8px] md:text-[10px] text-slate-500 uppercase">Max Reward</p>
              <p className="text-white font-black text-xs md:text-sm">+100 XP</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] md:text-[10px] text-slate-500 uppercase">To Pass</p>
              <p className="text-yellow-500 font-black text-xs md:text-sm">60 XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Confetti Canvas (Invisible but active) */}
      <canvas id="confetti-canvas" className="fixed inset-0 pointer-events-none z-[100]"></canvas>

      {/* --- OVERLAYS --- */}
      {result === 'SUCCESS' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-bounce-in">
          <div className="bg-green-600 text-white px-8 py-4 rounded-xl shadow-2xl transform -rotate-2">
            <h2 className="text-3xl font-black uppercase">VERIFIED</h2>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/95 backdrop-blur-sm animate-in fade-in">
          <div className="text-center p-8 max-w-md w-full">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <X size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">Disallowed!</h2>
            <p className="text-red-100 text-lg mb-8">{currentLevel.violationReason || "Audit Failed."}</p>
            <button onClick={onBack} className="w-full py-3 bg-white text-red-900 rounded-lg font-bold">
              Return to Lobby
            </button>
          </div>
        </div>
      )}

      {/* FINISHED */}
      {gameState === 'FINISHED' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-green-900/95 backdrop-blur-sm animate-in fade-in">
          <div className="text-center p-8 max-w-md w-full">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">Promotion Secure!</h2>
            <p className="text-green-100 text-lg mb-8">You completed the case with perfect accuracy.</p>
            <button onClick={onBack} className="w-full py-3 bg-white text-green-900 rounded-lg font-bold">
              Return to Lobby
            </button>
          </div>
        </div>
      )}

    </div>
  );
};


export default SimulationView;