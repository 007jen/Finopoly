import React from 'react';

interface DeviceMockupProps {
    children: React.ReactNode;
}

export const DeviceMockup: React.FC<DeviceMockupProps> = ({ children }) => {
    return (
        <div className="relative w-full max-w-5xl mx-auto pt-6 px-4 md:px-0">
            {/* Laptop Body (Top Lid) */}
            <div className="relative bg-[#0b0b10] rounded-[1.5rem] p-1.5 md:p-3 shadow-2xl ring-1 ring-white/10 border border-white/5 box-border">
                {/* Screen Enclosure */}
                <div className="relative bg-black rounded-xl overflow-hidden ring-1 ring-black/50 aspect-video md:aspect-auto">

                    {/* The Content */}
                    <div className="relative z-10 w-full h-full">
                        {children}
                    </div>

                    {/* GLOSS EFFECTS */}

                    {/* 1. Subtle Radial Sheen (Center) */}
                    <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-radial from-white/5 to-transparent opacity-30"></div>

                    {/* 2. Top-Right Reflection (Glass) */}
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/5 via-white/2 to-transparent -skew-x-12 opacity-10 pointer-events-none mix-blend-overlay"></div>

                    {/* 3. Screen Noise/Texture (Subtle Realism) */}
                    <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

                </div>

                {/* Webcam Notch (Optional visual detail, kept subtle) */}
                <div className="absolute top-2 md:top-3.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1a1a20] ring-1 ring-white/5 z-20"></div>
            </div>

            {/* Laptop Base (Bottom Keyboard Deck) */}
            {/* Uses negative margins to be wider than the 'screen' part */}
            <div className="relative mx-auto w-[104%] bg-[#121217] h-3 md:h-5 rounded-b-lg md:rounded-b-2xl shadow-xl border-t border-[#2a2a35] flex justify-center items-start z-30 mt-[-1px]">
                {/* Thumb notch to open laptop */}
                <div className="w-16 md:w-24 h-1 md:h-1.5 bg-[#1f1f26] rounded-b-md border-t border-black/30"></div>
            </div>

            {/* Reflection under the laptop */}
            <div className="absolute -bottom-10 left-4 right-4 h-12 bg-gradient-to-b from-purple-500/10 to-transparent blur-2xl -z-10"></div>
        </div>
    );
};
