import React from 'react';
import { LineChart, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChallengeProps {
    id: string;
    title: string;
    difficulty: string;
    isSolved: boolean;
}

export const ChallengeCard = ({ id, title, difficulty, isSolved }: ChallengeProps) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/challenges/${id}`)}
            className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${isSolved ? 'bg-green-100 text-green-600' : 'bg-teal-100 text-teal-600'}`}>
                    <LineChart className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">
                    {difficulty}
                </span>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
                Analyze real market data and calculate key metrics.
            </p>

            <div className="flex items-center text-sm font-medium text-teal-600">
                {isSolved ? 'Review Solution' : 'Start Challenge'}
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
};