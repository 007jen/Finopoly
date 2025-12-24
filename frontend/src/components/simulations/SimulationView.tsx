import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X, Flame, ShieldAlert, ArrowLeft } from 'lucide-react';
import { xpService } from '../../_xp/xp-service';

// --- Types ---
type PaymentMode = 'CASH' | 'BANK' | 'UPI';
type Action = 'ACCEPT' | 'REJECT';

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
  expectedAction: Action;
  violationReason?: string;
}

// --- Mock Data ---
const GAME_LEVELS: Level[] = [
  {
    id: 1,
    invoice: {
      vendor: "Sharma Traders",
      invoiceNo: "INV/23-24/890",
      date: "15-09-2024",
      amount: 100000,
      tax: 18000,
      total: 118000,
      description: "Consultancy Services",
      paymentMode: "BANK",
      gstin: "27ABCDE1234F1Z5"
    },
    ledger: {
      date: "15-09-24",
      particulars: "Consultancy Exp.",
      vchType: "Journal",
      vchNo: "890",
      debit: 100000,
      credit: null
    },
    expectedAction: 'ACCEPT'
  },
  {
    id: 2,
    invoice: {
      vendor: "Local Hardware Store",
      invoiceNo: "INV/24/890",
      date: "15-09-2024",
      amount: 20000,
      tax: 2000,
      total: 22000,
      description: "Office Repairs",
      paymentMode: "CASH",
      gstin: "27ABCDE1234F1Z5"
    },
    ledger: {
      date: "15-09-24",
      particulars: "Repairs & Maintenance",
      vchType: "Payment",
      vchNo: "452",
      debit: 22000,
      credit: null
    },
    expectedAction: 'REJECT',
    violationReason: "DISALLOWED: Section 40A(3) Violation"
  },
  // Add more levels...
];

const MAX_TIME = 300.0; // Increased time to 300s (5 mins) as per User Request

interface SimulationViewProps {
  caseId: string;
  onBack: () => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ onBack }) => {
  // Game State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [score, setScore] = useState(24500);
  const [streak, setStreak] = useState(8);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [gameState, setGameState] = useState<'PLAYING' | 'RESULT'>('PLAYING');
  const [result, setResult] = useState<'SUCCESS' | 'FAILURE' | null>(null);

  // NEW STATE: User remarks
  const [userDescription, setUserDescription] = useState('');
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const currentLevel = GAME_LEVELS[currentLevelIdx % GAME_LEVELS.length];

  // Helper to format timer like "0:04s"
  const formatTimerStr = (time: number) => {
    const seconds = Math.ceil(time);
    return `0:${seconds.toString().padStart(2, '0')}s remaining`;
  };

  // Timer Logic
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timer);
          handleDecision('REJECT', true); // Timeout forces failure
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState]);

  // Input Handling
  const handleDecision = useCallback((action: Action, isTimeout = false) => {
    if (gameState !== 'PLAYING') return;

    // Validation: Cannot submit without remarks (unless it's a timeout forced by system)
    if (!isTimeout && userDescription.trim().length === 0) {
      // Optional: shake the text area to indicate error
      descriptionInputRef.current?.focus();
      return;
    }

    const isCorrect = action === currentLevel.expectedAction;

    setGameState('RESULT');

    if (isCorrect && !isTimeout) {
      setResult('SUCCESS');
      const earnedXP = 100 + (streak * 10);
      setScore(s => s + earnedXP);
      setStreak(s => s + 1);
      // Phase 1: Award Real XP
      xpService.increment(earnedXP, 'Audit Simulation: Vouching Racer');
    } else {
      setResult('FAILURE');
      setStreak(0);
    }

    // Auto advance loop
    setTimeout(() => {
      setGameState('PLAYING');
      setResult(null);
      setTimeLeft(MAX_TIME);
      setUserDescription(''); // Reset description field
      setCurrentLevelIdx(prev => prev + 1);
      // Refocus the input for the next round automatically
      setTimeout(() => descriptionInputRef.current?.focus(), 100);
    }, 2000);
  }, [currentLevel, streak, gameState, userDescription]);

  // Keyboard Shortcuts (Only work if description has text)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in the textarea
      if (document.activeElement === descriptionInputRef.current && e.key !== "Enter") return;

      if (userDescription.trim().length > 0) {
        if (e.key === 'ArrowLeft') handleDecision('REJECT');
        if (e.key === 'ArrowRight') handleDecision('ACCEPT');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDecision, userDescription]);


  const isSubmitDisabled = userDescription.trim().length === 0 || gameState !== 'PLAYING';

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-slate-900 text-white font-sans overflow-hidden relative pb-4">

      {/* --- HEADER --- */}
      <div className="w-full max-w-6xl flex justify-between items-start p-4 bg-slate-800 border-b-4 border-slate-700 shadow-lg z-10 relative">
        <div className="flex-1">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-1 transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-bold uppercase">Exit Audit</span>
          </button>
          <h1 className="text-lg font-bold text-slate-200 leading-tight">Mehta & Co. Chartered Accountants</h1>
          <p className="text-sm text-slate-400">Client: Swastik Enterprises - Tax Audit</p>
        </div>

        {/* --- NEW: CENTER NUMERICAL TIMER --- */}
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <div className={`px-4 py-1.5 rounded-md font-mono font-bold text-sm transition-colors duration-300 shadow-inner
                ${timeLeft < 3 ? 'bg-red-600 text-white animate-pulse' : 'bg-red-800/80 text-slate-200'}`}>
            {formatTimerStr(timeLeft)}
          </div>
        </div>

        {/* Score Panel */}
        <div className="flex gap-6 items-center flex-1 justify-end">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Billable Value</p>
            <p className="text-xl font-mono font-bold text-yellow-400">₹{score.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Streak</p>
            <div className="flex items-center gap-1 justify-center text-orange-500 font-bold text-lg">
              <Flame size={18} fill="currentColor" />
              <span>x{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- GAME BOARD --- */}
      <div className="flex w-full max-w-6xl flex-1 gap-4 p-4 relative min-h-[450px]">

        {/* --- LEFT CARD: INVOICE --- */}
        <div className="flex-1 bg-slate-100 text-slate-900 rounded-lg shadow-2xl overflow-hidden relative border-l-8 border-yellow-500">
          <div className="bg-yellow-500 p-2 flex justify-between items-center text-slate-900 font-bold text-sm">
            <div className="flex items-center gap-2">
              <span>📄</span>
              <span>Payment Voucher</span>
            </div>
            <span>₹</span>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex justify-between border-b pb-3 border-slate-300">
              <div>
                <p className="text-[10px] text-slate-500 font-bold">VENDOR</p>
                <p className="text-base font-bold leading-tight">{currentLevel.invoice.vendor}</p>
                <p className="text-xs text-slate-600">{currentLevel.invoice.gstin}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold">INVOICE NO</p>
                <p className="font-mono text-sm">{currentLevel.invoice.invoiceNo}</p>
                <p className="text-xs">{currentLevel.invoice.date}</p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead className="bg-slate-200">
                <tr>
                  <th className="p-1.5 text-left">Description</th>
                  <th className="p-1.5 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1.5 font-medium">{currentLevel.invoice.description}</td>
                  <td className="p-1.5 text-right font-mono font-bold">₹{currentLevel.invoice.amount.toLocaleString()}</td>
                </tr>
                {currentLevel.invoice.tax > 0 && (
                  <tr>
                    <td className="p-1.5 text-slate-500">GST Total</td>
                    <td className="p-1.5 text-right font-mono text-slate-500">₹{currentLevel.invoice.tax.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center pt-2 border-t-2 border-slate-800">
              <p className="font-bold text-sm">Grand Total</p>
              <p className="text-xl font-bold font-mono">₹{currentLevel.invoice.total.toLocaleString()}</p>
            </div>

            {/* Payment Mode Indicator */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Mode:</span>
              {currentLevel.invoice.paymentMode === 'CASH' ? (
                <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Check size={12} /> CASH
                </span>
              ) : (
                <span className="bg-slate-300 text-slate-800 px-2 py-0.5 rounded-full text-xs font-bold">{currentLevel.invoice.paymentMode}</span>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT CARD: LEDGER --- */}
        <div className="flex-1 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-2 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-700">
            Client Ledger (Tally Prime View)
          </div>

          <div className="p-0 flex-1 overflow-auto bg-slate-800/50">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-yellow-500">
                <tr>
                  <th className="p-2 font-medium">Date</th>
                  <th className="p-2 font-medium">Particulars</th>
                  <th className="p-2 font-medium">Vch Type</th>
                  <th className="p-2 font-medium text-right">Debit (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="opacity-40 border-b border-slate-700">
                  <td className="p-2">12-09-24</td>
                  <td className="p-2">Bank A/c</td>
                  <td className="p-2">Payment</td>
                  <td className="p-2 text-right"></td>
                </tr>

                {/* ACTIVE ROW */}
                <tr className="bg-blue-900/60 border-l-4 border-blue-400 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                  <td className="p-2 text-white font-bold">{currentLevel.ledger.date}</td>
                  <td className="p-2 text-white font-bold">{currentLevel.ledger.particulars}</td>
                  <td className="p-2">{currentLevel.ledger.vchType}</td>
                  <td className="p-2 text-right font-mono font-bold text-white text-sm">
                    {currentLevel.ledger.debit?.toLocaleString()}
                  </td>
                </tr>
                <tr className="opacity-40">
                  <td className="p-2">...</td>
                  <td className="p-2">...</td>
                  <td className="p-2">...</td>
                  <td className="p-2 text-right">...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-2 bg-yellow-900/30 border-t border-yellow-700/50 m-2 rounded border-l-2 border-yellow-500 flex gap-2 items-start">
            <ShieldAlert size={16} className="text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-yellow-200 text-xs leading-tight">
              <span className="font-bold">AUDIT NOTE:</span> Match Date, Amount, and check 40A(3) compliance.
            </p>
          </div>
        </div>

        {/* --- RESULT OVERLAYS --- */}
        {result === 'SUCCESS' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-bounce-in backdrop-blur-[2px]">
            <div className="border-8 border-green-500 text-green-500 px-8 py-4 rounded-xl transform -rotate-12 bg-green-900/90 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
              <div className="text-5xl font-black uppercase tracking-tighter opacity-90 text-center">
                VERIFIED
              </div>
            </div>
          </div>
        )}

        {result === 'FAILURE' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
            <div className="border-8 border-red-600 text-red-600 px-8 py-6 rounded-sm transform rotate-6 bg-red-950/90 shadow-[0_0_50px_rgba(220,38,38,0.6)]">
              <div className="text-5xl font-black uppercase tracking-tighter text-center">
                DISALLOWED
              </div>
              <div className="text-lg font-bold text-white text-center mt-2 bg-red-600 px-2">
                {currentLevel.violationReason || "AUDIT Mismatch Detected"}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- NEW: AUDIT REMARKS INPUT --- */}
      <div className="w-full max-w-4xl px-4 pt-2 pb-0 z-20">
        <label className="text-xs text-slate-400 mb-1 block pl-1">
          Audit Remarks (Required before submission)
        </label>
        <textarea
          ref={descriptionInputRef}
          className={`w-full p-3 bg-slate-800 border-2 rounded-md text-slate-200 placeholder-slate-500 focus:border-yellow-500 focus:bg-slate-800/80 outline-none resize-none transition-all text-sm
              ${isSubmitDisabled && timeLeft > 0 ? 'border-red-900/50 animate-pulse' : 'border-slate-700'}`}
          rows={2}
          placeholder="E.g., 'Matched invoice with ledger entry' or 'Cash payment exceeds limit'..."
          value={userDescription}
          onChange={(e) => setUserDescription(e.target.value)}
          disabled={gameState !== 'PLAYING'}
          autoFocus
        />
      </div>

      {/* --- FOOTER CONTROLS --- */}
      <div className="w-full max-w-4xl p-4 flex justify-between gap-4 z-20">
        <button
          onClick={() => handleDecision('ACCEPT')}
          disabled={isSubmitDisabled}
          className={`flex-1 bg-green-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg border-b-4 border-green-800 flex items-center justify-center gap-2 transition-all
             ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500 active:border-b-0 active:translate-y-1'}`}>
          <span>ACCEPT (Right)</span>
          <Check size={24} strokeWidth={3} />
        </button>

        <button
          onClick={() => handleDecision('REJECT')}
          disabled={isSubmitDisabled}
          className={`flex-1 bg-red-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg border-b-4 border-red-800 flex items-center justify-center gap-2 transition-all
             ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 active:border-b-0 active:translate-y-1'}`}>
          <span>FLAG ISSUE (Left)</span>
          <X size={24} strokeWidth={3} />
        </button>
      </div>

    </div>
  );
};

export default SimulationView;