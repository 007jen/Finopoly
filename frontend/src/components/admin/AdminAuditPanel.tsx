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

        if (c.vouchers && Array.isArray(c.vouchers)) {
            setVouchers(c.vouchers);
        } else {
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
                invoiceDetails: vouchers[0]?.invoice,
                ledgerDetails: vouchers[0]?.ledger,
                expectedAction: vouchers[0]?.expectedAction,
                violationReason: vouchers[0]?.violationReason,
                faultyField: vouchers[0]?.faultyField
            };

            if (editingId) {
                await api.updateAuditCase(editingId, payload);
                setSuccess("Simulation logic successfully updated.");
            } else {
                await api.createAuditCase(payload);
                setSuccess("New simulation successfully deployed.");
            }

            setIsAdding(false);
            setEditingId(null);
            fetchCases();
        } catch (err: any) {
            setError(err.message || "Protocol failure: Deployment aborted.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to decommission this simulation?")) return;
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

    if (isLoading) return <div className="p-20 text-blue-600 text-center font-black animate-pulse uppercase tracking-[0.2em] text-sm">Synchronizing Simulation Pool...</div>;

    return (
        <div className="bg-transparent text-gray-900 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-1">Simulation Forge</h2>
                        <p className="text-gray-500 font-medium text-sm">Engineer complex multi-vector audit scenarios for the ecosystem.</p>
                    </div>
                    {!isAdding ? (
                        <button
                            onClick={() => { resetForm(); setIsAdding(true); }}
                            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-200 active:scale-95 uppercase tracking-widest text-xs"
                        >
                            <Plus size={16} />
                            Deploy New Logic
                        </button>
                    ) : (
                        <button
                            onClick={resetForm}
                            className="flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black transition-all active:scale-95 uppercase tracking-widest text-xs"
                        >
                            <X size={16} />
                            Abort Sequence
                        </button>
                    )}
                </header>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-5 rounded-[2rem] flex items-center gap-4 mb-8 text-red-700 animate-in slide-in-from-top-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[2rem] flex items-center gap-4 mb-8 text-emerald-700 animate-in slide-in-from-top-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-tight">{success}</p>
                    </div>
                )}

                {isAdding ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        {/* Sidebar: Navigation for Form */}
                        <div className="lg:col-span-1 space-y-3">
                            {[
                                { id: 'setup', label: 'Case Setup', icon: Settings, color: 'blue' },
                                { id: 'brief', label: 'Client Brief', icon: FileText, color: 'amber' },
                                { id: 'vouchers', label: `Samples (${vouchers.length})`, icon: Database, color: 'emerald' },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeFormTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveFormTab(tab.id as any)}
                                        className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${isActive
                                            ? `bg-white text-${tab.color}-600 shadow-xl shadow-gray-200 border border-gray-50 scale-105`
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActive ? `bg-${tab.color}-50` : 'bg-transparent'}`}>
                                            <Icon size={16} />
                                        </div>
                                        {tab.label}
                                    </button>
                                );
                            })}

                            <div className="pt-8 mt-4 border-t border-gray-100">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-gray-300 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                >
                                    <Save size={18} />
                                    {editingId ? 'Push Update' : 'Finalize Logic'}
                                </button>
                            </div>
                        </div>

                        {/* Main Editor Area */}
                        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden min-h-[600px]">
                            <div className="p-10 md:p-14 h-full">

                                {activeFormTab === 'setup' && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8">
                                        <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
                                            <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">General Parameters</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-8">
                                                <div>
                                                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-[0.15em]">Simulation Title</label>
                                                    <input
                                                        required
                                                        value={form.title}
                                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-gray-800 placeholder-gray-300"
                                                        placeholder="e.g. FY 24-25 Statutory Audit"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-[0.15em]">Legal Entity Name</label>
                                                    <input
                                                        required
                                                        value={form.companyName}
                                                        onChange={e => setForm({ ...form, companyName: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-gray-800 placeholder-gray-300"
                                                        placeholder="e.g. Finopoly Global Solutions"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-8">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-[0.15em]">Complexity</label>
                                                        <select
                                                            value={form.difficulty}
                                                            onChange={e => setForm({ ...form, difficulty: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800 cursor-pointer appearance-none"
                                                        >
                                                            <option>Beginner</option>
                                                            <option>Intermediate</option>
                                                            <option>Pro</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-[0.15em]">XP Yield</label>
                                                        <input
                                                            type="number"
                                                            value={form.xpReward}
                                                            onChange={e => setForm({ ...form, xpReward: parseInt(e.target.value) })}
                                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-blue-600"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-[0.15em]">Categorization Tags</label>
                                                    <input
                                                        value={form.tags}
                                                        onChange={e => setForm({ ...form, tags: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-400 italic placeholder-gray-300"
                                                        placeholder="Manufacturing, GST, Inventory..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-[0.15em]">Executive Summary</label>
                                            <textarea
                                                required
                                                value={form.description}
                                                onChange={e => setForm({ ...form, description: e.target.value })}
                                                rows={4}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium leading-relaxed text-gray-600"
                                                placeholder="Articulate the scope and objectives of this simulation..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeFormTab === 'brief' && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8">
                                        <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
                                            <div className="w-2 h-8 bg-amber-500 rounded-full" />
                                            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Contextual Framework</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div>
                                                <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-[0.15em]">Primary Industry</label>
                                                <input
                                                    value={form.industry}
                                                    onChange={e => setForm({ ...form, industry: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-gray-800"
                                                    placeholder="e.g. Fintech & Payments"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-[0.15em]">Audit Strategic Focus</label>
                                                <input
                                                    value={form.auditFocus}
                                                    onChange={e => setForm({ ...form, auditFocus: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-gray-800"
                                                    placeholder="e.g. Statutory Deductions Compliance"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-[0.15em]">Materiality Threshold & Protocols</label>
                                            <textarea
                                                value={form.materialityGuidance}
                                                onChange={e => setForm({ ...form, materialityGuidance: e.target.value })}
                                                rows={8}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-amber-500 outline-none transition-all text-sm font-medium leading-relaxed text-gray-600"
                                                placeholder="Establish the materiality logic and procedural hints for the analyst..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeFormTab === 'vouchers' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 h-full flex flex-col">
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-6 mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                                                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Intelligence Pool</h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddNewVoucher}
                                                className="px-5 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 shadow-sm border border-emerald-100"
                                            >
                                                <Plus size={14} />
                                                Inject Sample
                                            </button>
                                        </div>

                                        {/* Voucher Carousel */}
                                        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
                                            {vouchers.map((v, i) => (
                                                <button
                                                    key={v.id}
                                                    type="button"
                                                    onClick={() => setActiveVoucherIdx(i)}
                                                    className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase transition-all flex-shrink-0 border-2 ${activeVoucherIdx === i
                                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100 scale-105'
                                                        : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                                                        }`}
                                                >
                                                    LOG {i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Active Voucher Editor */}
                                        {vouchers[activeVoucherIdx] && (
                                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 flex-1">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <Database size={14} className="text-emerald-500" />
                                                        Configuration: Vector #{activeVoucherIdx + 1}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVoucher(activeVoucherIdx)}
                                                        className="text-red-500 hover:text-red-600 font-black text-[10px] uppercase underline underline-offset-4"
                                                    >
                                                        Purge Logic
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] mb-3">Expected Outcome</label>
                                                        <select
                                                            value={vouchers[activeVoucherIdx].expectedAction}
                                                            onChange={e => updateVoucher(activeVoucherIdx, { expectedAction: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-black text-gray-800 focus:bg-white transition-all appearance-none"
                                                        >
                                                            <option value="VERIFY">VERIFY (Acceptable)</option>
                                                            <option value="DISALLOW">DISALLOW (Audit Failure)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] mb-3">Target Discrepancy (if Failure)</label>
                                                        <input
                                                            value={vouchers[activeVoucherIdx].faultyField || ''}
                                                            onChange={e => updateVoucher(activeVoucherIdx, { faultyField: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-bold text-gray-800"
                                                            placeholder="Amount, Date, GSTIN..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-[400px]">
                                                    <div className="flex flex-col gap-4">
                                                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                            Invoice Schema (JSON)
                                                        </span>
                                                        <textarea
                                                            value={JSON.stringify(vouchers[activeVoucherIdx].invoice, null, 2)}
                                                            onChange={e => {
                                                                try {
                                                                    const val = JSON.parse(e.target.value);
                                                                    updateVoucher(activeVoucherIdx, { invoice: val });
                                                                } catch (err) { }
                                                            }}
                                                            className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl p-6 font-mono text-[11px] outline-none focus:ring-4 focus:ring-blue-500/10 text-blue-400 transition-all resize-none shadow-inner"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-4">
                                                        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                            General Ledger Logic (JSON)
                                                        </span>
                                                        <textarea
                                                            value={JSON.stringify(vouchers[activeVoucherIdx].ledger, null, 2)}
                                                            onChange={e => {
                                                                try {
                                                                    const val = JSON.parse(e.target.value);
                                                                    updateVoucher(activeVoucherIdx, { ledger: val });
                                                                } catch (err) { }
                                                            }}
                                                            className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl p-6 font-mono text-[11px] outline-none focus:ring-4 focus:ring-emerald-500/10 text-emerald-400 transition-all resize-none shadow-inner"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cases.map(c => (
                            <div key={c.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative flex flex-col min-h-[420px]">
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-3 z-10">
                                    <button
                                        onClick={() => handleEdit(c)}
                                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-3 bg-red-50 text-red-600 border border-red-50 rounded-xl hover:bg-red-600 hover:text-white"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mb-8">
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${c.difficulty === 'Pro' ? 'bg-red-600 text-white' :
                                        c.difficulty === 'Intermediate' ? 'bg-amber-400 text-amber-900' : 'bg-emerald-500 text-white'
                                        }`}>
                                        {c.difficulty}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300 font-bold text-[10px] uppercase">
                                        <Layers size={14} />
                                        <span>{c.vouchers ? JSON.parse(JSON.stringify(c.vouchers)).length : 1} Vectors</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight uppercase tracking-tighter line-clamp-2">{c.title}</h3>
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">{c.companyName}</p>
                                </div>

                                <p className="text-gray-400 text-sm font-medium line-clamp-3 mb-10 flex-1 leading-relaxed">{c.description}</p>

                                <div className="space-y-4 pt-8 border-t border-gray-50">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                                        <span>Economic Sector</span>
                                        <span className="text-gray-900">{c.clientBrief?.industry || 'Unspecified'}</span>
                                    </div>
                                    <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {cases.length === 0 && (
                            <div className="col-span-full py-40 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-8">
                                    <Shield className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tighter">Forge Repository Empty</h3>
                                <p className="text-gray-400 max-w-sm mt-4 font-medium">Initialize the ecosystem by deploying your first simulation binary.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAuditPanel;
