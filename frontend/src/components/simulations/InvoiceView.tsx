import React from 'react';

interface InvoiceViewProps {
    data: {
        vendor: string;
        invoiceNo: string;
        date: string;
        amount: number;
        tax: number;
        total: number;
        description: string;
        paymentMode: string;
        gstin: string;
    };
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ data }) => {
    return (
        <div className="bg-white text-slate-800 p-4 md:p-6 lg:p-10 shadow-lg border border-slate-200 min-h-0 md:min-h-[700px] flex flex-col font-sans max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 mb-8 md:mb-10">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-blue-900 tracking-tighter uppercase mb-2 leading-tight">
                        {data.vendor || 'YOUR COMPANY NAME'}
                    </h1>
                    <div className="text-[10px] text-slate-500 leading-tight space-y-0.5">
                        <p>123 Business Avenue, Tech Park</p>
                        <p>Mumbai, MH 400001</p>
                        <p>Phone: +91 22 1234 5678</p>
                        <p className="mt-1 font-bold text-blue-800 tracking-tight">GSTIN: {data.gstin || '27AAAAA0000A1Z5'}</p>
                    </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                    <h2 className="text-3xl md:text-5xl font-black text-blue-900/10 tracking-widest uppercase select-none leading-none">INVOICE</h2>
                    <div className="mt-4 space-y-1">
                        <div className="flex justify-start sm:justify-end gap-4 text-[10px] md:text-xs font-bold">
                            <span className="text-slate-400">DATE:</span>
                            <span className="text-slate-900 uppercase">{data.date}</span>
                        </div>
                        <div className="flex justify-start sm:justify-end gap-4 text-[10px] md:text-xs font-bold">
                            <span className="text-slate-400">INVOICE #:</span>
                            <span className="text-slate-900">{data.invoiceNo}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-[2px] bg-slate-200 w-full mb-8 relative">
                <div className="absolute inset-0 h-[1px] bg-blue-900/20 top-1"></div>
            </div>

            {/* Bill/Ship To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 mb-8 md:mb-10 text-[10px] md:text-[11px]">
                <div>
                    <h3 className="font-black text-slate-900 mb-2 uppercase tracking-wider">Bill To:</h3>
                    <div className="text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                        <p className="font-bold text-slate-800">C1005 - National Enterprises</p>
                        <p>Plot No. 45, Industrial Estate</p>
                        <p>Bangalore, KA 560001</p>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <h3 className="font-black text-slate-900 mb-2 uppercase tracking-wider">Ship To:</h3>
                    <div className="text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 italic">
                        <p>Same as billing address</p>
                    </div>
                </div>
            </div>

            {/* Secondary Meta Table - Stacked on Mobile */}
            <div className="grid grid-cols-3 sm:grid-cols-6 border border-slate-300 mb-8 rounded-sm overflow-hidden shadow-sm">
                {['P.O. #', 'Sales Rep', 'Ship Date', 'Ship Via', 'Terms', 'Due Date'].map((header) => (
                    <div key={header} className="bg-blue-50/50 border-r border-slate-300 p-2 text-[8px] md:text-[9px] font-black text-blue-800 text-center uppercase truncate">
                        {header}
                    </div>
                ))}
                {['PO-9912', 'Admin', data.date, 'Ground', 'Net 30', 'Next Month'].map((val, i) => (
                    <div key={i} className="border-r border-slate-300 p-2 text-[9px] md:text-[10px] text-center text-slate-600 font-medium min-h-[30px] flex items-center justify-center truncate">
                        {val}
                    </div>
                ))}
            </div>

            {/* Line Items Table */}
            <div className="flex-1">
                <div className="border border-slate-300 rounded-sm overflow-hidden">
                    <table className="w-full text-left text-[11px] border-collapse">
                        <thead className="bg-blue-900/5 text-blue-900 font-black uppercase tracking-wider">
                            <tr>
                                <th className="p-3 border-r border-slate-300">Description</th>
                                <th className="p-3 border-r border-slate-300 text-center w-20">Quantity</th>
                                <th className="p-3 border-r border-slate-300 text-right w-24">Unit Price</th>
                                <th className="p-3 text-right w-24">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600">
                            <tr className="border-t border-slate-200 bg-slate-50/30">
                                <td className="p-4 border-r border-slate-300 font-medium">{data.description}</td>
                                <td className="p-4 border-r border-slate-300 text-center">1.00</td>
                                <td className="p-4 border-r border-slate-300 text-right font-mono">₹{data.amount.toLocaleString()}</td>
                                <td className="p-4 text-right font-mono font-bold text-slate-900">₹{data.amount.toLocaleString()}</td>
                            </tr>
                            {/* Padding empty rows to maintain structure */}
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="border-t border-slate-100 h-10">
                                    <td className="p-3 border-r border-slate-300"></td>
                                    <td className="p-3 border-r border-slate-300"></td>
                                    <td className="p-3 border-r border-slate-300"></td>
                                    <td className="p-3"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-8 border-t-2 border-slate-100 pt-8 gap-8 sm:gap-0">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center">
                            <span className="text-white font-black text-sm uppercase">U</span>
                        </div>
                        <div>
                            <p className="text-xs font-black text-blue-900 tracking-tighter">UniformSoftware</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Digital Solutions Provider</p>
                        </div>
                    </div>
                    <p className="text-[10px] italic text-slate-400">THANK YOU FOR YOUR BUSINESS!</p>
                </div>

                <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-[10px] md:text-[11px] font-bold">
                        <span className="text-slate-400 uppercase">SUBTOTAL</span>
                        <span className="text-slate-900 font-mono">₹{data.amount.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between text-[10px] md:text-[11px] font-bold border-b border-slate-100 pb-2">
                        <span className="text-slate-400 uppercase">GST (18%)</span>
                        <span className="text-slate-900 font-mono">₹{data.tax.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between text-base md:text-lg font-black bg-blue-900 text-white p-3 rounded shadow-lg shadow-blue-900/20">
                        <span className="tracking-tighter uppercase text-sm md:text-base">Total</span>
                        <span className="font-mono">₹{data.total.toLocaleString()}.00</span>
                    </div>
                    <p className="text-[9px] text-left sm:text-right text-slate-400 font-bold uppercase mt-2">
                        MODE: <span className="text-blue-800">{data.paymentMode}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceView;
