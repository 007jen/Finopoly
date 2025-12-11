import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, User, Shield, BookOpen } from 'lucide-react';

const OnboardingModal: React.FC = () => {
  const { updateUser, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    level: '',
    preferredAreas: [] as string[],
  });

  const handleRoleSelect = (role: 'Student' | 'Partner') => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleLevelSelect = (level: 'Beginner' | 'Intermediate' | 'Pro') => {
    setFormData({ ...formData, level });
    setStep(3);
  };

  const handleAreaToggle = (area: string) => {
    const updatedAreas = formData.preferredAreas.includes(area)
      ? formData.preferredAreas.filter(a => a !== area)
      : [...formData.preferredAreas, area];
    setFormData({ ...formData, preferredAreas: updatedAreas });
  };

  const handleComplete = async () => {
    await completeOnboarding(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Finopoly!</h2>
          <button
            onClick={handleComplete}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">What best describes you?</p>
            <button
              onClick={() => handleRoleSelect('Student')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-3"
            >
              <User className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">CA Student</div>
                <div className="text-sm text-gray-500">Article trainee or pursuing CA</div>
              </div>
            </button>
            <button
              onClick={() => handleRoleSelect('Partner')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center gap-3"
            >
              <Shield className="w-6 h-6 text-indigo-600" />
              <div className="text-left">
                <div className="font-semibold">CA Partner</div>
                <div className="text-sm text-gray-500">Practicing CA or firm partner</div>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">What's your current level?</p>
            {['Beginner', 'Intermediate', 'Pro'].map((level) => (
              <button
                key={level}
                onClick={() => handleLevelSelect(level as any)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-semibold">{level}</div>
                <div className="text-sm text-gray-500">
                  {level === 'Beginner' && 'Just starting out'}
                  {level === 'Intermediate' && 'Some experience with auditing'}
                  {level === 'Pro' && 'Advanced practitioner'}
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">Select your preferred areas (choose multiple):</p>
            {['Audit', 'Tax', 'Case Law', 'Compliance', 'Financial Reporting'].map((area) => (
              <button
                key={area}
                onClick={() => handleAreaToggle(area)}
                className={`w-full p-3 border-2 rounded-lg transition-colors text-left ${formData.preferredAreas.includes(area)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">{area}</span>
                </div>
              </button>
            ))}
            <button
              onClick={handleComplete}
              disabled={formData.preferredAreas.length === 0}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-6"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;