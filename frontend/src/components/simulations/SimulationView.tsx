import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X, Flame, ShieldAlert, ArrowLeft, AlertCircle } from 'lucide-react';
import { xpService } from '../../_xp/xp-service';
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
  const [isShaking, setIsShaking] = useState(false);

  // CHECKLIST STATE
  const [auditStep, setAuditStep] = useState(0);
  const [auditOrder, setAuditOrder] = useState<AuditField[]>([]);
  // We don't really need a full record of selections if we are replacing them, 
  // but it might be useful for tracking what happened.
  const [selections, setSelections] = useState<Record<AuditField, FieldStatus>>({
    Vendor: null,
    Date: null,
    Amount: null,
    Tax: null,
    Compliance: null
  });

  const AUDIT_FIELDS: AuditField[] = ['Vendor', 'Date', 'Amount', 'Tax', 'Compliance'];

  // DYNAMIC DATA
  const [levels, setLevels] = useState<Level[]>([]);
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
    // 3. Reset Selections
    setSelections({
      Vendor: null,
      Date: null,
      Amount: null,
      Tax: null,
      Compliance: null
    });
  }, [currentLevelIdx]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const currentLevel = levels[currentLevelIdx % levels.length];

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
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState, currentLevel]);

  // Shake Effect on Failure
  useEffect(() => {
    if (result === 'FAILURE') {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [result]);

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
    setGameState('RESULT');
    setResult('SUCCESS');
    setScore(s => s + 5000);
    setStreak(s => s + 1);
    triggerVictoryConfetti(); // BLAST CONFETTI

    setTimeout(async () => {
      if (currentLevelIdx >= levels.length - 1) {
        setResult(null);
        setGameState('FINISHED');
        xpService.increment(500, 'Audit Challenge: Perfect Completion');
        // Increment global simulation count
        const token = await getToken();
        api.post('/api/profile/simulations/increment', {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(() => {
          refreshUser();
        }).catch(console.error);
      } else {
        setGameState('PLAYING');
        setResult(null);
        setTimeLeft(MAX_TIME);
        setCurrentLevelIdx(prev => prev + 1);
      }
    }, 1500);
  };

  const handleStepDecision = (field: AuditField, choice: FieldStatus) => {
    if (gameState !== 'PLAYING' || !currentLevel) return;

    // 1. Record the visual selection
    setSelections(prev => ({ ...prev, [field]: choice }));

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
    <div className={`flex flex-col items-center justify-start min-h-screen bg-slate-900 text-white font-sans overflow-hidden relative pb-4 
        ${isShaking ? 'animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}`}>

      {/* HEADER */}
      <div className="w-full max-w-6xl flex justify-between items-start p-4 bg-slate-800 border-b-4 border-slate-700 shadow-lg z-10 relative">
        <div className="flex-1">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-1 transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-bold uppercase">Exit Audit</span>
          </button>
          <h1 className="text-lg font-bold text-slate-200 leading-tight">Mehta & Co. Chartered Accountants</h1>
          <p className="text-sm text-slate-400">Client: Swastik Enterprises - Tax Audit</p>
        </div>

        {/* TIMER */}
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <div className={`px-4 py-1.5 rounded-md font-mono font-bold text-sm transition-colors duration-300 shadow-inner ${timeLeft < 5 ? 'bg-red-600 animate-pulse' : 'bg-red-800/80'}`}>
            {Math.ceil(timeLeft)}s remaining
          </div>
        </div>

        {/* STATS */}
        <div className="flex gap-6 items-center flex-1 justify-end">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase">Billable Value</p>
            <p className="text-xl font-mono font-bold text-yellow-400">₹{score.toLocaleString()}</p>
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

      {/* DOCUMENT AREA */}
      <div className="flex w-full max-w-6xl flex-1 gap-4 p-4 relative min-h-[400px]">
        {/* INVOICE CARD */}
        <div className="flex-1 bg-slate-100 text-slate-900 rounded-lg shadow-xl overflow-hidden relative border-l-8 border-yellow-500">
          <div className="bg-yellow-500 p-2 flex justify-between text-xs font-bold">
            <span>PAYMENT VOUCHER</span>
            <span>ORIGINAL</span>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between">
              <h2 className="font-bold text-lg">{currentLevel.invoice.vendor}</h2>
              <span className="font-mono text-sm">{currentLevel.invoice.date}</span>
            </div>
            <div className="text-xs text-slate-500">{currentLevel.invoice.gstin}</div>
            <div className="py-2 border-y border-slate-300 my-2">
              <div className="flex justify-between text-sm">
                <span>{currentLevel.invoice.description}</span>
                <span className="font-mono font-bold">₹{currentLevel.invoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>GST (18%)</span>
                <span className="font-mono">₹{currentLevel.invoice.tax.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-200 p-2 rounded">
              <span className="font-bold text-sm">TOTAL</span>
              <span className="font-bold text-xl font-mono">₹{currentLevel.invoice.total.toLocaleString()}</span>
            </div>
            <div className="mt-2 text-xs font-bold text-slate-500 uppercase">
              Paid via: <span className="text-slate-900">{currentLevel.invoice.paymentMode}</span>
            </div>
          </div>
        </div>

        {/* LEDGER CARD */}
        <div className="flex-1 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tally Prime View
          </div>
          <div className="p-4 font-mono text-xs text-green-400">
            <div className="grid grid-cols-4 gap-4 border-b border-slate-600 pb-2 mb-2 text-slate-500">
              <span>Date</span>
              <span className="col-span-2">Particulars</span>
              <span className="text-right">Debit</span>
            </div>
            <div className="grid grid-cols-4 gap-4 bg-slate-700/50 p-1 rounded">
              <span>{currentLevel.ledger.date}</span>
              <span className="col-span-2">{currentLevel.ledger.particulars}</span>
              <span className="text-right">{(currentLevel.ledger.debit || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="p-4 mt-auto">
            <div className="flex items-start gap-2 text-yellow-500 text-xs bg-yellow-900/20 p-2 rounded border border-yellow-700/50">
              <ShieldAlert size={14} className="mt-0.5" />
              <span>Verify 40A(3) Compliance and GST Input Credit eligibility.</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKLIST UI - SINGLE CARD RANDOM POP */}
      <div className="w-full max-w-4xl px-4 pb-4 z-20">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-[1fr,auto,auto] gap-2 p-3 bg-slate-900/50 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className="pl-2">Pending Audit Parameter ({auditStep + 1}/{AUDIT_FIELDS.length})</span>
            <span className="w-24 text-center">Status</span>
            <span className="w-24 text-center">Action</span>
          </div>

          {activeField && (
            <div key={activeField} className="grid grid-cols-[1fr,auto,auto] gap-4 p-4 items-center animate-in zoom-in-95 duration-300">
              <span className="font-semibold pl-2 text-lg text-white flex items-center gap-2">
                {activeField} Check
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </span>

              <div className="flex gap-4">
                <button
                  onClick={() => handleStepDecision(activeField, 'VALID')}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-slate-700 text-slate-200 hover:bg-green-600 hover:text-white hover:scale-105 transition-all shadow-lg"
                >
                  <Check size={16} /> Valid
                </button>

                <button
                  onClick={() => handleStepDecision(activeField, 'FRAUD')}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-slate-700 text-slate-200 hover:bg-red-600 hover:text-white hover:scale-105 transition-all shadow-lg"
                >
                  <AlertCircle size={16} /> Fraud
                </button>
              </div>

              <div className="w-6" /> {/* Spacer */}
            </div>
          )}

          <div className="p-2 bg-slate-900/50 text-center text-[10px] text-slate-400">
            * Verify the displayed parameter. Next check will appear automatically if valid.
          </div>
        </div>
      </div>

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
            <h2 className="text-3xl font-bold mb-4 text-white">Audit Certified!</h2>
            <div className="bg-white/10 p-4 rounded-lg mb-6"><span className="text-xl font-bold">+500 XP</span></div>
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