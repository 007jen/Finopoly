import { Download, ZoomIn } from 'lucide-react';

interface ContextProps {
    challenge: any; // You can define a stricter type if you like
}

export const ContextPanel = ({ challenge }: ContextProps) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-12 mb-8">
            {/* 1. Breadcrumbs & Centered Header */}
            <div className="text-center mb-10">
                <nav className="flex justify-center items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    <span>All Data Drills</span>
                    <span className="opacity-30">/</span>
                    <span className="text-teal-600 truncate max-w-[150px] sm:max-w-none">#{challenge.id.split('-').pop()} {challenge.title}</span>
                </nav>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                    {challenge.title}
                </h1>
            </div>

            <div className="space-y-12">
                {/* 2. Your Objective Section */}
                <section>
                    <div className="text-center mb-6">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 inline-block border-b-4 border-teal-500/20 pb-1">
                            Your Objective
                        </h2>
                    </div>
                    <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed text-base sm:text-lg">
                        <p>{challenge.description}</p>
                    </div>
                </section>

                {/* 3. The Main Visualization (Chart) */}
                <section className="relative group">
                    <div className="aspect-[16/9] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-inner flex items-center justify-center">
                        {challenge.chartUrl ? (
                            <img src={challenge.chartUrl} alt="Main Visual" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-300 font-bold uppercase tracking-widest">Awaiting Visualization</div>
                        )}
                    </div>
                    <button className="absolute top-4 right-4 bg-white/95 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                        <ZoomIn className="w-5 h-5 text-teal-600" />
                    </button>
                    <p className="mt-4 text-center text-xs text-gray-400 italic">Figure 1.1: Historical performance and technical indicators</p>
                </section>

                {/* 4. Methodology & Instructions Section */}
                {challenge.instructions && (
                    <section className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100">
                        <div className="prose prose-slate max-w-none">
                            <p className="font-medium text-gray-900 mb-6">
                                To complete the drill, <span className="text-teal-600 font-black">create a table</span> containing the date, close price, and the following derived columns:
                            </p>
                            <ul className="space-y-4 list-none p-0">
                                {challenge.instructions.split('\n').map((step: string, idx: number) => {
                                    const [title, desc] = step.split(':');
                                    return (
                                        <li key={idx} className="flex gap-3 sm:gap-4">
                                            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-black text-[10px] sm:text-xs">
                                                {idx + 1}
                                            </span>
                                            <div className="text-sm sm:text-base">
                                                <strong className="text-gray-900 font-black">{title}:</strong>
                                                <span className="text-gray-600 ml-1">{desc}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Sample Data Image (The Table Reference) */}
                        {challenge.sampleDataUrl && (
                            <div className="mt-8 border rounded-xl overflow-hidden shadow-sm bg-white p-2">
                                <img src={challenge.sampleDataUrl} alt="Table Reference" className="w-full opacity-90 grayscale hover:grayscale-0 transition-all cursor-zoom-in" />
                                <div className="p-3 bg-gray-50 text-[10px] text-gray-400 font-bold uppercase text-center border-t">
                                    Reference Table Structure
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {challenge.datasetUrl && (
                    <div className="flex justify-center">
                        <button
                            onClick={async () => {
                                try {
                                    const response = await fetch(challenge.datasetUrl);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    const fileName = `${challenge.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
                                    a.download = fileName;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                } catch (err) {
                                    window.open(challenge.datasetUrl, '_blank');
                                }
                            }}
                            className="group flex items-center justify-center gap-3 bg-teal-600 text-white w-full lg:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-teal-700 transition-all hover:shadow-2xl hover:-translate-y-1"
                        >
                            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                            Download Dataset
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
