import React, { useState, useEffect } from 'react';

interface LedgerData {
    date: string;
    particulars: string;
    vchType: string;
    vchNo: string;
    debit: number | null;
    credit: number | null;
}

interface TallyAuditViewProps {
    ledger: LedgerData;
    onSubmit: (userData: LedgerData) => void;
    isSubmitting?: boolean;
    /* --- AZURE CLOUD START --- */
    autoFillData?: any;
    /* --- AZURE CLOUD END --- */
}

const TallyAuditView: React.FC<TallyAuditViewProps> = ({ ledger, onSubmit, isSubmitting, autoFillData }) => {
    const [formData, setFormData] = useState<LedgerData>({
        date: '',
        particulars: '',
        vchType: 'Journal',
        vchNo: ledger.vchNo,
        debit: null,
        credit: null
    });

    const [activeField, setActiveField] = useState<string>('particulars');

    useEffect(() => {
        // Reset form when level changes
        setFormData({
            date: '',
            particulars: '',
            vchType: ledger.vchType || 'Journal',
            vchNo: ledger.vchNo,
            debit: null,
            credit: null
        });
        setActiveField('particulars');
    }, [ledger]);

    /* --- AZURE CLOUD START --- */
    useEffect(() => {
        if (autoFillData) {
            setFormData(prev => ({
                ...prev,
                date: autoFillData.date || prev.date,
                particulars: autoFillData.vendor || prev.particulars,
                debit: autoFillData.total || autoFillData.amount || prev.debit
            }));
        }
    }, [autoFillData]);
    /* --- AZURE CLOUD END --- */

    const handleChange = (field: keyof LedgerData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isSubmitting) {
            if (formData.particulars && (formData.debit || formData.credit)) {
                onSubmit(formData);
            }
        }
    };

    return (
        <div className="bg-[#003c43] text-[#aefbff] p-3 md:p-6 shadow-2xl border-2 border-[#135d66] h-full md:min-h-[700px] flex flex-col font-mono relative overflow-hidden max-w-full rounded-xl md:rounded-none">
            {/* Tally Header Bar */}
            <div className="bg-[#135d66] -mx-3 md:-mx-6 -mt-3 md:-mt-6 p-2 flex justify-between items-center text-[9px] md:text-[10px] font-bold text-white shadow-md mb-2 md:mb-0">
                <div className="flex gap-2 md:gap-4 truncate">
                    <span className="bg-[#4169e1] px-1.5 py-0.5 rounded shrink-0">VCH Creation</span>
                    <span className="opacity-80 truncate hidden sm:inline">National Enterprises</span>
                </div>
                <div className="flex gap-2 text-[8px] uppercase shrink-0">
                    <span className="opacity-60 hidden xs:inline">Accounting Voucher</span>
                </div>
            </div>

            {/* Main Title & Date - Mobile Optimized */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center my-2 md:my-4 border-b border-[#77b0aa]/30 pb-2 gap-2">
                <div className="flex justify-between items-center">
                    <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#e4be1e] truncate pr-2">Accounting Voucher Creation</h2>
                    <div className="text-[9px] md:text-[10px] text-right bg-[#135d66] px-2 py-1 rounded shrink-0">
                        <p className="font-bold">No. {ledger.vchNo}</p>
                    </div>
                </div>

                {/* Mobile Date Row within Header block */}
                <div className="flex justify-between md:justify-end items-center gap-2 text-xs md:text-sm">
                    <span className="text-[#77b0aa]">Date:</span>
                    <input
                        type="text"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        placeholder="e.g. 1-Aug-20"
                        className="bg-transparent border-b border-[#77b0aa]/30 focus:border-[#e4be1e] outline-none w-24 md:w-32 text-right transition-colors p-1"
                    />
                </div>
            </div>

            {/* Entry Area - Stacked on Mobile */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                {/* Headers - Hidden on Mobile, Visible on Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 text-[11px] font-black text-[#77b0aa] uppercase border-b border-[#77b0aa]/20 pb-2">
                    <div className="col-span-1">Dr</div>
                    <div className="col-span-7 leading-none">Particulars</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-2 text-right">Credit</div>
                </div>

                {/* Mobile Label */}
                <div className="md:hidden text-[10px] uppercase font-black text-[#77b0aa] mb-1">
                    Transaction Entry
                </div>

                {/* Dynamic Entry Row */}
                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-start bg-[#135d66]/10 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none border border-[#77b0aa]/10 md:border-none">

                    {/* Dr/Cr Indicator & Particulars */}
                    <div className="flex md:col-span-8 items-start gap-2 w-full">
                        <div className="text-[#e4be1e] font-black text-sm md:text-sm leading-none mt-2 shrink-0">Dr</div>
                        <div className="relative w-full">
                            <label className="md:hidden text-[9px] text-[#77b0aa] uppercase font-bold mb-1 block">Particulars / Ledger</label>
                            <input
                                type="text"
                                value={formData.particulars}
                                onFocus={() => setActiveField('particulars')}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => handleChange('particulars', e.target.value)}
                                placeholder="Select Ledger..."
                                className={`w-full bg-transparent border-b outline-none transition-all py-2 md:py-1 text-sm ${activeField === 'particulars' ? 'border-[#e4be1e] bg-[#135d66]/30' : 'border-[#77b0aa]/20'
                                    }`}
                            />
                            {activeField === 'particulars' && (
                                <div className="absolute top-full left-0 w-full bg-[#004e57] border border-[#77b0aa]/50 shadow-2xl z-30 mt-1 max-h-40 overflow-y-auto rounded-b-lg">
                                    {Array.from(new Set(['Cash', 'Sales A/c', 'Purchase A/c', 'Bank A/c', 'GST Input', ledger.particulars])).filter(l => l).map(ledgerName => (
                                        <div
                                            key={ledgerName}
                                            onClick={() => { handleChange('particulars', ledgerName); setActiveField('debit'); }}
                                            className="p-3 md:p-2 hover:bg-[#e4be1e] hover:text-[#003c43] cursor-pointer border-b border-[#003c43]/20 text-xs font-medium transition-colors"
                                        >
                                            {ledgerName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="flex md:col-span-2 items-center justify-between md:justify-end gap-4 w-full">
                        <label className="md:hidden text-[9px] text-[#77b0aa] uppercase font-bold block">Debit Amount (₹)</label>
                        <input
                            type="number"
                            value={formData.debit || ''}
                            onFocus={() => setActiveField('debit')}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => handleChange('debit', parseFloat(e.target.value))}
                            placeholder="0.00"
                            className={`w-32 md:w-full bg-transparent text-right border-b outline-none py-2 md:py-1 text-sm font-bold ${activeField === 'debit' ? 'border-[#e4be1e] bg-[#135d66]/30' : 'border-[#77b0aa]/20'
                                }`}
                        />
                    </div>

                    <div className="hidden md:block col-span-2 text-right">
                        <span className="opacity-20 italic text-[10px]">Auto</span>
                    </div>
                </div>

                {/* Narration */}
                <div className="mt-4 md:mt-20 px-1">
                    <span className="text-[10px] uppercase text-[#77b0aa] block mb-1 font-bold">Narration:</span>
                    <input
                        type="text"
                        placeholder="Being payment made towards..."
                        className="w-full bg-transparent border-dashed border-b border-[#77b0aa]/30 py-2 outline-none italic text-xs text-white placeholder:text-white/20"
                    />
                </div>
            </div>

            {/* Accept Dialog Simulation - Sticky Bottom */}
            <div className="mt-auto px-1 pt-4 pb-2">
                <button
                    onClick={() => onSubmit(formData)}
                    className="w-full md:w-auto float-right bg-[#135d66] border-2 border-[#e4be1e] text-[#e4be1e] px-8 py-3 rounded-lg md:rounded-none font-black uppercase text-xs md:text-sm hover:bg-[#e4be1e] hover:text-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                    <span className="md:hidden">Submit Voucher</span>
                    <span className="hidden md:inline">Accept? (Y/N)</span>
                </button>
            </div>

            {/* Tally Key Shortcuts Bar - Horizontal Scroll on Mobile */}
            <div className="bg-[#135d66] -mx-3 md:-mx-6 -mb-3 md:-mb-6 p-2 overflow-x-auto whitespace-nowrap scrollbar-hide mt-4 border-t border-[#77b0aa]/20">
                <div className="flex gap-2 min-w-max px-1">
                    {[
                        { k: 'F2', d: 'Date' },
                        { k: 'F4', d: 'Contra' },
                        { k: 'F5', d: 'Paymt' },
                        { k: 'F6', d: 'Recpt' },
                        { k: 'F7', d: 'Jnrl' },
                        { k: 'F8', d: 'Sale' }
                    ].map(sh => (
                        <div key={sh.k} className="bg-[#003c43] px-2 py-1 rounded border border-[#77b0aa]/20 inline-flex items-center text-[8px] md:text-[9px] font-black uppercase text-[#aefbff]">
                            <span className="opacity-70 mr-1">{sh.k}:</span> {sh.d}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TallyAuditView;
