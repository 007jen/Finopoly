import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Shield, Plus, Trash2, X, AlertCircle, CheckCircle2, FileText, Settings, Database, Edit3, Save, Layers } from 'lucide-react';

interface Voucher {
    id: string;
    invoice: any;
    ledger: any;
    expectedAction: string;
    violationReason?: string;
    faultyField?: string;
}

interface AuditCase {
    id: string;
    title: string;
    companyName: string;
    difficulty: string;
    description: string;
    invoiceDetails: any;
    ledgerDetails: any;
    clientBrief?: any;
    vouchers?: any; // Array of Voucher
    expectedAction: string;
    violationReason?: string;
    faultyField?: string;
    tags: string[];
    xpReward: number;
    timeLimit?: number;
}

const DEFAULT_JSON_TEMPLATE = {
    invoice: {
        vendor: "Digital Solutions Ltd",
        invoiceNo: "DSL/20/441",
        date: "14-Aug-2025",
        amount: 42000,
        tax: 7560,
        total: 49560,
        description: "Enterprise Server License - Annual",
        paymentMode: "Bank Transfer",
        gstin: "27AAACD9912A1Z1"
    },
    ledger: {
        date: "14-Aug-2025",
        particulars: "Purchase A/c",
        vchType: "Purchase",
        vchNo: "441",
        debit: 42000,
        credit: 0
    }
};

const AdminAuditPanel: React.FC = () => {
    const [cases, setCases] = useState<AuditCase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeFormTab, setActiveFormTab] = useState<'setup' | 'brief' | 'vouchers'>('setup');

    const [form, setForm] = useState({
        title: '',
        companyName: '',
        difficulty: 'Intermediate',
        description: '',
        tags: 'Manufacturing, GST',
        xpReward: 150,
        timeLimit: 60,
        // Briefing
        industry: 'Information Technology',
        auditFocus: 'Operating Expenses & Statutory Compliance',
        materialityGuidance: 'Materiality is generally set at 2-5% of Profit Before Tax. For this client, ₹15,000 is a reasonable threshold.',
    });

    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [activeVoucherIdx, setActiveVoucherIdx] = useState<number>(0);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const data = await api.listAdminAuditCases();
            setCases(data);
        } catch (err) {
            console.error('Failed to fetch cases:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (c: AuditCase) => {
        setEditingId(c.id);
        setIsAdding(true);
        setForm({
            title: c.title,
            companyName: c.companyName,
            difficulty: c.difficulty,
            description: c.description,
            tags: c.tags.join(', '),
            xpReward: c.xpReward,
            timeLimit: c.timeLimit || 60,
            industry: c.clientBrief?.industry || 'Unknown',
            auditFocus: c.clientBrief?.auditFocus || 'General',
            materialityGuidance: c.clientBrief?.materialityGuidance || '',
        });

        // Initialize vouchers list
        if (c.vouchers && Array.isArray(c.vouchers)) {
            setVouchers(c.vouchers);
        } else {
            // Fallback: Create one voucher from top-level details if available
            setVouchers([{
                id: Math.random().toString(36).substr(2, 9),
                invoice: c.invoiceDetails || DEFAULT_JSON_TEMPLATE.invoice,
                ledger: c.ledgerDetails || DEFAULT_JSON_TEMPLATE.ledger,
                expectedAction: c.expectedAction || 'VERIFY',
                violationReason: c.violationReason,
                faultyField: c.faultyField
            }]);
        }
        setActiveVoucherIdx(0);
        setActiveFormTab('setup');
    };

    const handleAddNewVoucher = () => {
        const newV: Voucher = {
            id: Math.random().toString(36).substr(2, 9),
            invoice: { ...DEFAULT_JSON_TEMPLATE.invoice },
            ledger: { ...DEFAULT_JSON_TEMPLATE.ledger },
            expectedAction: 'VERIFY'
        };
        setVouchers([...vouchers, newV]);
        setActiveVoucherIdx(vouchers.length);
    };

    const updateVoucher = (idx: number, updates: Partial<Voucher>) => {
        const newVouchers = [...vouchers];
        newVouchers[idx] = { ...newVouchers[idx], ...updates };
        setVouchers(newVouchers);
    };

    const removeVoucher = (idx: number) => {
        if (vouchers.length <= 1) return;
        setVouchers(vouchers.filter((_, i) => i !== idx));
        if (activeVoucherIdx >= idx) setActiveVoucherIdx(Math.max(0, activeVoucherIdx - 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                title: form.title,
                companyName: form.companyName,
                difficulty: form.difficulty,
                description: form.description,
                tags: form.tags.split(',').map(t => t.trim()),
                xpReward: Number(form.xpReward),
                timeLimit: Number(form.timeLimit),
                clientBrief: {
                    industry: form.industry,
                    auditFocus: form.auditFocus,
                    materialityGuidance: form.materialityGuidance
                },
                vouchers: vouchers,
                // Legacy fields (v0 compatibility) - use first voucher
                invoiceDetails: vouchers[0]?.invoice,
                ledgerDetails: vouchers[0]?.ledger,
                expectedAction: vouchers[0]?.expectedAction,
                violationReason: vouchers[0]?.violationReason,
                faultyField: vouchers[0]?.faultyField
            };

            if (editingId) {
                await api.updateAuditCase(editingId, payload);
                setSuccess("Audit case successfully updated!");
            } else {
                await api.createAuditCase(payload);
                setSuccess("Audit case successfully created!");
            }

            setIsAdding(false);
            setEditingId(null);
            fetchCases();
        } catch (err: any) {
            setError(err.message || "Failed to save audit case.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this case?")) return;
        try {
            await api.deleteAuditCase(id);
            fetchCases();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setIsAdding(false);
        setForm({
            title: '',
            companyName: '',
            difficulty: 'Intermediate',
            description: '',
            tags: 'Manufacturing, GST',
            xpReward: 150,
            timeLimit: 60,
            industry: 'Information Technology',
            auditFocus: 'Operating Expenses & Statutory Compliance',
            materialityGuidance: 'Materiality is generally set at 2-5% of Profit Before Tax. For this client, ₹15,000 is a reasonable threshold.',
        });
        setVouchers([{
            id: Math.random().toString(36).substr(2, 9),
            invoice: { ...DEFAULT_JSON_TEMPLATE.invoice },
            ledger: { ...DEFAULT_JSON_TEMPLATE.ledger },
            expectedAction: 'VERIFY'
        }]);
    };

    if (isLoading) return <div className="p-10 text-white text-center font-black animate-pulse uppercase tracking-widest">Initialising Audit Control Systems...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                                <Shield className="text-white w-6 h-6" />
                            </div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">Simulation Forge</h1>
                        </div>
                        <p className="text-slate-400 font-medium">Create complex multi-voucher audit sessions for cloud deployment.</p>
                    </div>
                    {!isAdding ? (
                        <button
                            onClick={() => { resetForm(); setIsAdding(true); }}
                            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 active:scale-95 uppercase tracking-widest text-sm"
                        >
                            <Plus size={20} />
                            BUILD NEW CASE
                        </button>
                    ) : (
                        <button
                            onClick={resetForm}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black transition-all active:scale-95 uppercase tracking-widest text-sm"
                        >
                            <X size={20} />
                            ABORT FORGE
                        </button>
                    )}
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 mb-8 animate-in slide-in-from-top-4">
                        <AlertCircle className="text-red-500" />
                        <p className="text-red-200 text-sm font-bold">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-4 mb-8 animate-in slide-in-from-top-4">
                        <CheckCircle2 className="text-green-500" />
                        <p className="text-green-200 text-sm font-bold">{success}</p>
                    </div>
                )}

                {isAdding ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in zoom-in duration-300">
                        {/* Sidebar: Navigation for Form */}
                        <div className="lg:col-span-1 space-y-3">
                            <button
                                onClick={() => setActiveFormTab('setup')}
                                className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeFormTab === 'setup' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                <Settings size={18} />
                                Case Setup
                            </button>
                            <button
                                onClick={() => setActiveFormTab('brief')}
                                className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeFormTab === 'brief' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                <FileText size={18} />
                                Client Briefing
                            </button>
                            <button
                                onClick={() => setActiveFormTab('vouchers')}
                                className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeFormTab === 'vouchers' ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                <Database size={18} />
                                Sampling Pool ({vouchers.length})
                            </button>

                            <div className="pt-8 border-t border-slate-800">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-slate-100 hover:bg-white text-slate-900 font-black py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    {editingId ? 'UPDATE FORGE' : 'FINALIZE FORGE'}
                                </button>
                            </div>
                        </div>

                        {/* Main Editor Area */}
                        <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-8 md:p-12 h-full overflow-y-auto">

                                {activeFormTab === 'setup' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter text-blue-400">Identity & Metadata</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Case Title</label>
                                                    <input
                                                        required
                                                        value={form.title}
                                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-bold text-slate-200"
                                                        placeholder="e.g. FY 24-25 Statutory Audit"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Client Legal Name</label>
                                                    <input
                                                        required
                                                        value={form.companyName}
                                                        onChange={e => setForm({ ...form, companyName: e.target.value })}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-bold text-slate-200"
                                                        placeholder="e.g. Swastik Enterprises Pvt Ltd"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Difficulty</label>
                                                        <select
                                                            value={form.difficulty}
                                                            onChange={e => setForm({ ...form, difficulty: e.target.value })}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-bold text-slate-200 cursor-pointer"
                                                        >
                                                            <option>Beginner</option>
                                                            <option>Intermediate</option>
                                                            <option>Pro</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">XP Reward</label>
                                                        <input
                                                            type="number"
                                                            value={form.xpReward}
                                                            onChange={e => setForm({ ...form, xpReward: parseInt(e.target.value) })}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-mono font-black"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Tags (Searchability)</label>
                                                    <input
                                                        value={form.tags}
                                                        onChange={e => setForm({ ...form, tags: e.target.value })}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-bold text-slate-400 italic"
                                                        placeholder="Manufacturing, GST, Inventory..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Scenario Summary</label>
                                            <textarea
                                                required
                                                value={form.description}
                                                onChange={e => setForm({ ...form, description: e.target.value })}
                                                rows={4}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all text-sm font-medium leading-relaxed"
                                                placeholder="Briefly explain the audit scenario..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeFormTab === 'brief' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter text-orange-400">Contextual Briefing</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Primary Industry</label>
                                                <input
                                                    value={form.industry}
                                                    onChange={e => setForm({ ...form, industry: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:border-orange-500 outline-none transition-all font-bold"
                                                    placeholder="e.g. Manufacturing & Textiles"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Audit Focus Area</label>
                                                <input
                                                    value={form.auditFocus}
                                                    onChange={e => setForm({ ...form, auditFocus: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:border-orange-500 outline-none transition-all font-bold"
                                                    placeholder="e.g. Input tax Credit (ITC) Verification"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Materiality & Guidance Notes</label>
                                            <textarea
                                                value={form.materialityGuidance}
                                                onChange={e => setForm({ ...form, materialityGuidance: e.target.value })}
                                                rows={8}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:border-orange-500 outline-none transition-all text-sm font-medium leading-relaxed"
                                                placeholder="Provide the user with professional clues or materiality logic..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeFormTab === 'vouchers' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
                                        <header className="flex justify-between items-center">
                                            <h2 className="text-2xl font-black uppercase tracking-tighter text-green-400">Voucher Pool</h2>
                                            <button
                                                type="button"
                                                onClick={handleAddNewVoucher}
                                                className="px-4 py-2 bg-green-600/20 text-green-400 rounded-xl font-black text-[10px] uppercase hover:bg-green-600 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <Plus size={14} />
                                                ADD SAMPLE
                                            </button>
                                        </header>

                                        {/* Voucher Carousel / List */}
                                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-slate-700">
                                            {vouchers.map((v, i) => (
                                                <button
                                                    key={v.id}
                                                    type="button"
                                                    onClick={() => setActiveVoucherIdx(i)}
                                                    className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase transition-all flex-shrink-0 border ${activeVoucherIdx === i
                                                        ? 'bg-green-600 border-green-500 text-white shadow-lg'
                                                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                                                        }`}
                                                >
                                                    VOUCHER #{i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Active Voucher Editor */}
                                        {vouchers[activeVoucherIdx] && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 flex-1">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-black uppercase tracking-widest text-[11px] text-slate-500">Editing Voucher Entry #{activeVoucherIdx + 1}</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVoucher(activeVoucherIdx)}
                                                        className="text-red-500 hover:text-red-400 font-bold text-[10px] uppercase underline underline-offset-4"
                                                    >
                                                        Delete Sample
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest">Expected Auditor Action</label>
                                                        <select
                                                            value={vouchers[activeVoucherIdx].expectedAction}
                                                            onChange={e => updateVoucher(activeVoucherIdx, { expectedAction: e.target.value })}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 font-bold"
                                                        >
                                                            <option value="VERIFY">VERIFY (Correct)</option>
                                                            <option value="DISALLOW">DISALLOW (Error)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest">Faulty Field (If Error)</label>
                                                        <input
                                                            value={vouchers[activeVoucherIdx].faultyField || ''}
                                                            onChange={e => updateVoucher(activeVoucherIdx, { faultyField: e.target.value })}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
                                                            placeholder="Amount, Date, GSTIN..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
                                                    <div className="flex flex-col gap-3">
                                                        <span className="text-[10px] text-blue-400 font-black uppercase">Source Invoice (JSON)</span>
                                                        <textarea
                                                            value={JSON.stringify(vouchers[activeVoucherIdx].invoice, null, 2)}
                                                            onChange={e => {
                                                                try {
                                                                    const val = JSON.parse(e.target.value);
                                                                    updateVoucher(activeVoucherIdx, { invoice: val });
                                                                } catch (err) { }
                                                            }}
                                                            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl p-4 font-mono text-[11px] outline-none focus:border-blue-500 text-blue-300 transition-all resize-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <span className="text-[10px] text-green-400 font-black uppercase">Accounting Entry (JSON)</span>
                                                        <textarea
                                                            value={JSON.stringify(vouchers[activeVoucherIdx].ledger, null, 2)}
                                                            onChange={e => {
                                                                try {
                                                                    const val = JSON.parse(e.target.value);
                                                                    updateVoucher(activeVoucherIdx, { ledger: val });
                                                                } catch (err) { }
                                                            }}
                                                            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl p-4 font-mono text-[11px] outline-none focus:border-green-500 text-green-300 transition-all resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                        {cases.map(c => (
                            <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl hover:border-blue-500/50 transition-all group relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                                    <button
                                        onClick={() => handleEdit(c)}
                                        className="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-400 transition-all shadow-xl shadow-blue-500/20"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-400 transition-all shadow-xl shadow-red-500/20"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.difficulty === 'Pro' ? 'bg-red-500 text-white' :
                                        c.difficulty === 'Intermediate' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-black'
                                        }`}>
                                        {c.difficulty}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs font-bold">
                                        <Layers size={14} />
                                        <span>{c.vouchers ? JSON.parse(JSON.stringify(c.vouchers)).length : 1} SAMPLES</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-slate-100 mb-2 leading-tight uppercase tracking-tighter">{c.title}</h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-blue-400 text-xs font-black uppercase tracking-widest">{c.companyName}</p>
                                </div>

                                <p className="text-slate-400 text-sm font-medium line-clamp-3 mb-8 flex-1 leading-relaxed">{c.description}</p>

                                <div className="space-y-3 pt-6 border-t border-slate-700">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span>Materiality Threshold</span>
                                        <span className="text-slate-200">{c.clientBrief?.industry || 'Unknown'}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full w-[65%]" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {cases.length === 0 && (
                            <div className="col-span-full py-32 bg-slate-800/30 rounded-[3rem] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-center">
                                <Shield className="w-16 h-16 text-slate-700 mb-6" />
                                <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">The Vault is Empty</h3>
                                <p className="text-slate-500 max-w-sm mt-2">Start your simulation deployment by forging your first audit case.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAuditPanel;
