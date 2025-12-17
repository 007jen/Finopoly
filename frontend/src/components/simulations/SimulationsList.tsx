import React, { useState } from 'react';
import { Clock, Users, Award, ArrowRight, Filter } from 'lucide-react';
import { mockAuditCases } from '../../data/mockData';

interface SimulationsListProps {
  onStartSimulation: (caseId: string) => void;
}

const SimulationsList: React.FC<SimulationsListProps> = ({ onStartSimulation }) => {
  const [filter, setFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Pro'>('All');

  const filteredCases = filter === 'All' 
    ? mockAuditCases 
    : mockAuditCases.filter(c => c.difficulty === filter);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Pro': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Audit Simulations</h1>
          <p className="text-gray-600">Practice with real-world audit scenarios</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Pro">Pro</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredCases.map((auditCase) => (
          <div key={auditCase.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{auditCase.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{auditCase.company}</p>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{auditCase.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(auditCase.difficulty)}`}>
                {auditCase.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 mb-4 text-xs sm:text-sm text-gray-500 flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {auditCase.timeLimit || 0} mins
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {auditCase.tasks.length} tasks
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                {auditCase.xpReward} XP
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-sm text-gray-500">
                {auditCase.documents.length} documents provided
              </div>
              <button
                onClick={() => onStartSimulation(auditCase.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 w-full sm:w-auto justify-center"
              >
                Start Simulation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationsList;