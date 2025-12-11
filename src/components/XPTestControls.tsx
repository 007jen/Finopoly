import React from 'react';
import { useXP } from '../_xp/xp-context';
import { useAccuracy } from '../_accuracy/accuracy-context';

const XPTestControls: React.FC = () => {
    const { addXP, resetXP } = useXP();
    const { resetAccuracy } = useAccuracy();

    const handleReset = () => {
        resetXP();
        resetAccuracy();
    };

    return (
        <div className="fixed bottom-4 right-4 flex gap-2 p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <button
                onClick={() => addXP(10)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
                title="Simulate completing an activity"
            >
                Add 10 XP
            </button>
            <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
            >
                Reset Progress
            </button>
        </div>
    );
};

export default XPTestControls;
