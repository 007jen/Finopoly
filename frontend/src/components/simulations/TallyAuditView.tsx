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
        <div className="bg-[#003c43] text-[#aefbff] p-4 md:p-6 shadow-2xl border-2 border-[#135d66] min-h-0 md:min-h-[700px] flex flex-col font-mono relative overflow-hidden max-w-full">
            {/* Tally Header Bar */}
            <div className="bg-[#135d66] -mx-4 md:-mx-6 -mt-4 md:-mt-6 p-2 flex justify-between items-center text-[8px] md:text-[10px] font-bold text-white shadow-md">
                <div className="flex gap-2 md:gap-4 truncate">
                    <span className="bg-[#4169e1] px-1.5 py-0.5 rounded shrink-0">VCH Creation</span>
                    <span className="opacity-80 truncate hidden sm:inline">National Enterprises</span>
                </div>
                <div className="flex gap-2 text-[8px] uppercase shrink-0">
                    <span className="opacity-60 hidden xs:inline">Accounting Voucher</span>
                </div>
            </div>

            {/* Main Title */}
            <div className="flex justify-between items-center my-4 border-b border-[#77b0aa]/30 pb-2">
                <h2 className="text-sm font-black uppercase tracking-widest text-[#e4be1e]">Accounting Voucher Creation</h2>
                <div className="text-[10px] text-right bg-[#135d66] px-3 py-1 rounded">
                    <p className="font-bold">No. {ledger.vchNo}</p>
                </div>
            </div>

            {/* Date Row */}
            <div className="flex justify-end gap-2 mb-6 text-sm">
                <span className="text-[#77b0aa]">Date:</span>
                <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    placeholder="e.g. 1-Aug-20"
                    className="bg-transparent border-b border-[#77b0aa]/30 focus:border-[#e4be1e] outline-none w-32 text-right transition-colors"
                />
            </div>

            {/* Entry Area */}
            <div className="flex-1 space-y-4">
                <div className="grid grid-cols-12 gap-2 md:gap-4 text-[9px] md:text-[11px] font-black text-[#77b0aa] uppercase border-b border-[#77b0aa]/20 pb-2">
                    <div className="col-span-1">Dr</div>
                    <div className="col-span-7 md:col-span-7 leading-none">Particulars</div>
                    <div className="col-span-4 md:col-span-2 text-right">Amount</div>
                    <div className="hidden md:block col-span-2 text-right">Credit</div>
                </div>

                {/* Dynamic Entry Row */}
                <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
                    <div className="col-span-1 text-[#e4be1e] font-black text-xs md:text-sm leading-none">Dr</div>
                    <div className="col-span-7 md:col-span-7 relative">
                        <input
                            type="text"
                            value={formData.particulars}
                            onFocus={() => setActiveField('particulars')}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => handleChange('particulars', e.target.value)}
                            placeholder="Select Ledger..."
                            className={`w-full bg-transparent border-b outline-none transition-all py-1.5 md:py-1 text-xs md:text-sm ${activeField === 'particulars' ? 'border-[#e4be1e] bg-[#135d66]/30' : 'border-[#77b0aa]/20'
                                }`}
                        />
                        {activeField === 'particulars' && !formData.particulars && (
                            <div className="absolute top-full left-0 w-full bg-[#135d66] border border-[#77b0aa]/50 shadow-2xl z-20 mt-1 max-h-48 overflow-y-auto">
                                {Array.from(new Set(['Cash', 'Sales A/c', 'Purchase A/c', 'Bank A/c', 'GST Input', ledger.particulars])).map(ledgerName => (
                                    <div
                                        key={ledgerName}
                                        onClick={() => { handleChange('particulars', ledgerName); setActiveField('debit'); }}
                                        className="p-3 md:p-2 hover:bg-[#77b0aa] hover:text-[#003c43] cursor-pointer border-b border-[#003c43]/20 text-xs"
                                    >
                                        {ledgerName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="col-span-4 md:col-span-2 text-right">
                        <input
                            type="number"
                            value={formData.debit || ''}
                            onFocus={() => setActiveField('debit')}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => handleChange('debit', parseFloat(e.target.value))}
                            placeholder="0.00"
                            className={`w-full bg-transparent text-right border-b outline-none py-1.5 md:py-1 text-xs md:text-sm font-bold ${activeField === 'debit' ? 'border-[#e4be1e] bg-[#135d66]/30' : 'border-[#77b0aa]/20'
                                }`}
                        />
                    </div>
                    <div className="hidden md:block col-span-2 text-right">
                        <span className="opacity-20 italic text-[10px]">Auto</span>
                    </div>
                </div>

                {/* Narration */}
                <div className="mt-20">
                    <span className="text-[10px] uppercase text-[#77b0aa] block mb-1">Narration:</span>
                    <input
                        type="text"
                        placeholder="Being payment made towards..."
                        className="w-full bg-transparent border-dashed border-b border-[#77b0aa]/30 py-1 outline-none italic text-xs text-white"
                    />
                </div>
            </div>

            {/* Accept Dialog Simulation */}
            <div className="flex justify-end mt-10">
                <button
                    onClick={() => onSubmit(formData)}
                    className="bg-[#135d66] border-2 border-[#e4be1e] text-[#e4be1e] px-10 py-3 font-black uppercase text-sm hover:bg-[#e4be1e] hover:text-black transition-all shadow-xl active:scale-95"
                >
                    Accept? (Y/N)
                </button>
            </div>

            {/* Tally Key Shortcuts Bar - Wrapped for Mobile */}
            <div className="bg-[#135d66] -mx-4 md:-mx-6 -mb-4 md:-mb-6 p-2 grid grid-cols-3 sm:grid-cols-6 gap-1.5 md:gap-1 text-[7px] md:text-[8px] font-black uppercase text-center mt-6 shadow-inner opacity-50 overflow-hidden">
                {[
                    { k: 'F2', d: 'Date' },
                    { k: 'F4', d: 'Contra' },
                    { k: 'F5', d: 'Paymt' },
                    { k: 'F6', d: 'Recpt' },
                    { k: 'F7', d: 'Jnrl' },
                    { k: 'F8', d: 'Sale' }
                ].map(sh => (
                    <div key={sh.k} className="bg-[#003c43] p-1 rounded border border-[#77b0aa]/20 truncate">
                        <span className="text-[#aefbff] mr-0.5">{sh.k}:</span> {sh.d}
                    </div>
                ))}
            </div>

            {/* Instructions */}
            <div className="absolute bottom-20 left-6 right-6 pointer-events-none opacity-40">
                <p className="text-[9px] text-center border border-dashed border-[#77b0aa] p-2 rounded">
                    TAB to move forward • ENTER to submit • ESC to cancel
                </p>
            </div>
        </div>
    );
};

export default TallyAuditView;
