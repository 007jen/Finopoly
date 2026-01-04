import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Flame, ShieldAlert, ArrowLeft, AlertCircle, Shield } from 'lucide-react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { api } from '../../lib/api';

// --- Types ---
type PaymentMode = 'CASH' | 'BANK' | 'UPI';
type AuditField = 'Vendor' | 'Date' | 'Amount' | 'Tax' | 'Compliance';
type FieldStatus = 'VALID' | 'FRAUD' | null;

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
  invoice: InvoiceData;
  ledger: LedgerData;
  // If faultyField is null, it's a Clean Case (All Valid)
  faultyField: AuditField | null;
  violationReason?: string;
}

// --- Mock Data ---
// --- Mock Data ---
// Removed hardcoded levels to enforce API usage.
const GAME_LEVELS: Level[] = [];

const MAX_TIME = 30.0;

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

  // Animation State

  // CHECKLIST STATE
  const [auditStep, setAuditStep] = useState(0);
  const [auditOrder, setAuditOrder] = useState<AuditField[]>([]);
  // We don't really need a full record of selections if we are replacing them, 
  // but it might be useful for tracking what happened.

  const AUDIT_FIELDS: AuditField[] = ['Vendor', 'Date', 'Amount', 'Tax', 'Compliance'];

  // DYNAMIC DATA
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useClerkAuth();
  const { refreshUser, awardBadges } = useAuth();

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
          // Transform Data
          const mappedLevels: Level[] = fetchedData.map((item: any, idx: number) => ({
            id: item.id || idx,
            invoice: item.invoiceDetails,
            ledger: item.ledgerDetails,
            faultyField: item.faultyField || null, // Ensure null if empty string
            violationReason: item.violationReason
          }));
          setLevels(mappedLevels);
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
  const logAttempt = async (isSuccess: boolean) => {
    try {
      const token = await getToken();
      const res = await api.post<any>('/api/audit/complete', {
        caseId,
        score: isSuccess ? 100 : 0,
        success: isSuccess
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshUser();
      return res;
    } catch (error) {
      console.error("Failed to log activity:", error);
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

  const handleLevelComplete = (success: boolean) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    if (success) {
      setGameState('RESULT');
      setResult('SUCCESS');
      setScore(s => s + 5000);
      setStreak(s => s + 1);
      triggerVictoryConfetti();

      setTimeout(async () => {
        if (currentLevelIdx >= levels.length - 1) {
          setResult(null);
          setGameState('FINISHED');
          const res = await logAttempt(true);
          if (res?.newBadges && res.newBadges.length > 0) {
            awardBadges(res.newBadges);
          }
        } else {
          setGameState('PLAYING');
          setResult(null);
          setTimeLeft(MAX_TIME);
          setCurrentLevelIdx(prev => prev + 1);
        }
      }, 1500);
    }
  };

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
          logAttempt(false); // Log failure to backend
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState, currentLevel]);


  const handleStepDecision = (field: AuditField, choice: FieldStatus) => {
    if (gameState !== 'PLAYING' || !currentLevel) return;

    // 1. Record the visual selection (logic here if needed)

    // 2. Validate IMMEDIATELY
    const isFaultyField = currentLevel.faultyField === field;

    let isCorrectStep = false;
    let gameOverReason = "";

    if (isFaultyField) {
      // This IS the error. User must catch it.
      if (choice === 'FRAUD') {
        isCorrectStep = true;
        handleLevelComplete(true);
        return;
      } else {
        // User marked a Fraud field as Valid.
        isCorrectStep = false;
        gameOverReason = `Missed the error in ${field}.`;
      }
    } else {
      // This is a normal valid field.
      if (choice === 'VALID') {
        isCorrectStep = true;
        const nextStep = auditStep + 1;
        // Check if we exhausted all fields
        if (nextStep >= AUDIT_FIELDS.length) {
          handleLevelComplete(true);
          return;
        } else {
          // Advance to next random field
          setAuditStep(nextStep);
          return;
        }
      } else {
        // User marked a Valid field as Fraud.
        isCorrectStep = false;
        gameOverReason = `False Accusation! ${field} is actually correct.`;
      }
    }

    // Handing Failure
    if (!isCorrectStep) {
      setResult('FAILURE');
      setStreak(0);
      currentLevel.violationReason = gameOverReason;
      setGameState('GAME_OVER');
      logAttempt(false); // Log failure to backend
    }
  };


  if (loading) return <div className="text-white">Loading...</div>;

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


  if (loading) return <div className="text-white">Loading...</div>;

  // Active Field to Display
  const activeField = auditOrder[auditStep];

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans overflow-hidden relative">

      {/* 1. HEADER (Fixed) */}
      <div className="flex-none p-2 md:p-4 bg-slate-800 border-b-4 border-slate-700 shadow-lg z-20 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-0">
          <div className="flex-1 w-full md:w-auto text-center md:text-left">
            <button onClick={onBack} className="flex items-center justify-center md:justify-start gap-2 text-slate-400 hover:text-white mb-1 transition-colors">
              <ArrowLeft size={16} />
              <span className="text-xs font-bold uppercase">Exit Audit</span>
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-200 leading-tight truncate">Mehta & Co. Chartered Accountants</h1>
            <p className="text-xs md:text-sm text-slate-400">Client: Swastik Enterprises - Tax Audit</p>
          </div>

          {/* TIMER */}
          <div className="order-first md:order-none md:absolute md:left-1/2 md:top-4 md:-translate-x-1/2 w-full md:w-auto flex justify-center">
            <div className={`px-4 py-1.5 rounded-md font-mono font-bold text-sm transition-colors duration-300 shadow-inner ${timeLeft < 5 ? 'bg-red-600 animate-pulse' : 'bg-red-800/80'}`}>
              {Math.ceil(timeLeft)}s remaining
            </div>
          </div>

          {/* STATS */}
          <div className="flex gap-4 md:gap-6 items-center flex-1 justify-center md:justify-end w-full md:w-auto">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase">Billable Value</p>
              <p className="text-lg md:text-xl font-mono font-bold text-yellow-400">₹{score.toLocaleString()}</p>
            </div>
            <div className="text-center">
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40 md:pb-24 scroll-smooth">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* DOCUMENT AREA */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* INVOICE CARD */}
            <div className="flex-1 bg-slate-100 text-slate-900 rounded-lg shadow-xl overflow-hidden relative border-l-8 border-yellow-500 w-full shrink-0">
              <div className="bg-yellow-500 p-2 flex justify-between text-xs font-bold">
                <span>PAYMENT VOUCHER</span>
                <span>ORIGINAL</span>
              </div>
              <div className="p-4 lg:p-10 space-y-4">
                <div className="flex justify-between flex-wrap gap-2">
                  <h2 className="font-bold text-lg lg:text-3xl break-words">{currentLevel.invoice.vendor}</h2>
                  <span className="font-mono text-sm lg:text-xl whitespace-nowrap">{currentLevel.invoice.date}</span>
                </div>
                <div className="text-xs text-slate-500">{currentLevel.invoice.gstin}</div>
                <div className="py-4 border-y border-slate-300 my-4">
                  <div className="flex justify-between text-base lg:text-xl">
                    <span className="break-words mr-2">{currentLevel.invoice.description}</span>
                    <span className="font-mono font-bold">₹{currentLevel.invoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs lg:text-sm text-slate-500 mt-2">
                    <span>GST (18%)</span>
                    <span className="font-mono">₹{currentLevel.invoice.tax.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-200 p-3 lg:p-4 rounded-xl">
                  <span className="font-bold text-sm lg:text-lg">TOTAL</span>
                  <span className="font-bold text-xl lg:text-4xl font-mono">₹{currentLevel.invoice.total.toLocaleString()}</span>
                </div>
                <div className="mt-2 text-xs font-bold text-slate-500 uppercase">
                  Paid via: <span className="text-slate-900">{currentLevel.invoice.paymentMode}</span>
                </div>
              </div>
            </div>

            {/* LEDGER CARD */}
            <div className="flex-1 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden flex flex-col w-full min-h-[350px] lg:min-h-[550px]">
              <div className="bg-slate-900 p-2 lg:p-3 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">
                Tally Prime View
              </div>

              {/* Scrollable Table Container */}
              <div className="flex-1 p-4 lg:p-10 font-mono text-xs lg:text-base text-green-400 overflow-x-auto">
                <div className="min-w-[400px]"> {/* Force min width to prevent squashing */}
                  <div className="grid grid-cols-[1fr,2fr,1fr] gap-6 border-b border-slate-600 pb-3 mb-4 text-slate-500 uppercase text-[10px] lg:text-xs tracking-widest font-black">
                    <span>Date</span>
                    <span>Particulars</span>
                    <span className="text-right">Debit</span>
                  </div>
                  <div className="grid grid-cols-[1fr,2fr,1fr] gap-4 bg-slate-700/50 p-2 rounded hover:bg-slate-700 transition-colors">
                    <span>{currentLevel.ledger.date}</span>
                    <span>{currentLevel.ledger.particulars}</span>
                    <span className="text-right">{(currentLevel.ledger.debit || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 mt-auto border-t border-slate-700/50">
                <div className="flex items-start gap-3 text-yellow-500 text-xs bg-yellow-900/10 p-3 rounded border border-yellow-700/30">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">Verify 40A(3) Compliance and GST Input Credit eligibility.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-8 md:h-0"></div> {/* Extra spacer for mobile scroll */}
        </div>
      </div>

      {/* 3. CHECKLIST UI & ACTIONS (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-800 border-t border-slate-700 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] z-50 p-4 md:p-6 pb-6 safe-area-inset-bottom">
        <div className="max-w-[1400px] mx-auto">
          {activeField && (
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between animate-in slide-in-from-bottom-5 duration-300">

              {/* Question / Parameter */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Pending Audit Parameter ({auditStep + 1}/{AUDIT_FIELDS.length})</p>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    {activeField} Check
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </h3>
                </div>
              </div>

              {/* Actions */}
              <div className="flex w-full md:w-auto gap-3">
                <button
                  onClick={() => handleStepDecision(activeField, 'FRAUD')}
                  disabled={gameState !== 'PLAYING'}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-700 text-slate-300 border border-slate-600 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AlertCircle size={18} /> Reject
                </button>

                <button
                  onClick={() => handleStepDecision(activeField, 'VALID')}
                  disabled={gameState !== 'PLAYING'}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} /> Verify
                </button>
              </div>
            </div>
          )}
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