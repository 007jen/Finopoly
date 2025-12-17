import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, TrendingUp, Award, Zap, Play } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, signup, verifyEmail } = useAuth(); // Added verifyEmail
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false); // New state
  const [code, setCode] = useState(''); // New state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAnimating(true);

    try {
      if (isSignup) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      if (err.message === "VERIFICATION_NEEDED") {
        setPendingVerification(true);
        setError("Please check your email for a verification code.");
      } else {
        setError(err.message || 'An error occurred');
      }
      setIsAnimating(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAnimating(true);
    try {
      await verifyEmail(code);
      // If successful, auth state changes and redirects
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setIsAnimating(false);
    }
  };

  /* handleDemoLogin removed */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 lg:-top-40 -right-20 lg:-right-40 w-40 lg:w-80 h-40 lg:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 lg:-bottom-40 -left-20 lg:-left-40 w-40 lg:w-80 h-40 lg:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-20 lg:top-40 left-20 lg:left-40 w-30 lg:w-60 h-30 lg:h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <TrendingUp className="absolute top-10 lg:top-20 left-10 lg:left-20 w-6 lg:w-8 h-6 lg:h-8 text-blue-300 opacity-30 animate-bounce" style={{ animationDelay: '0s' }} />
        <Award className="absolute top-16 lg:top-32 right-16 lg:right-32 w-5 lg:w-6 h-5 lg:h-6 text-yellow-300 opacity-40 animate-bounce" style={{ animationDelay: '1s' }} />
        <Zap className="absolute bottom-20 lg:bottom-32 left-16 lg:left-32 w-6 lg:w-7 h-6 lg:h-7 text-purple-300 opacity-35 animate-bounce" style={{ animationDelay: '2s' }} />
        <Shield className="absolute bottom-16 lg:bottom-20 right-10 lg:right-20 w-6 lg:w-8 h-6 lg:h-8 text-indigo-300 opacity-30 animate-bounce" style={{ animationDelay: '3s' }} />
      </div>

      {/* Login Card - Properly Contained */}
      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 lg:p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <Shield className="w-8 lg:w-10 h-8 lg:h-10 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              Finopoly
            </h1>
            <p className="text-white/80 text-base lg:text-lg font-semibold mb-2">Master Finance Through Play</p>
            <p className="text-white/60 text-sm lg:text-base">Join thousands learning Audit, Tax & Case Law</p>
          </div>

          {!pendingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {isSignup && (
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:outline-none focus:border-white/50 transition-all"
                  />
                </div>
              )}

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:outline-none focus:border-white/50 transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8} // Clerk default
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:outline-none focus:border-white/50 transition-all"
                />
              </div>

              {/* Added for invisible captcha fallback */}
              <div id="clerk-captcha"></div>

              <button
                type="submit"
                disabled={isAnimating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
              >
                {isAnimating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                {isSignup ? 'Sign Up' : 'Log In'}
              </button>

              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="w-full text-white/70 hover:text-white text-sm transition-colors"
              >
                {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4 mb-6">
              <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-xl text-sm mb-4">
                Code sent to {email}
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:outline-none focus:border-white/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isAnimating}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
              >
                {isAnimating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Verify Email"
                )}
              </button>

              <button
                type="button"
                onClick={() => setPendingVerification(false)}
                className="w-full text-white/70 hover:text-white text-sm transition-colors"
                disabled={isAnimating}
              >
                Back to Sign Up
              </button>
            </form>
          )}

          {/* Stats Section - Properly Spaced */}
          <div className="text-center">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-white">10K+</div>
                <div className="text-xs lg:text-sm text-white/60 font-medium">Students</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-white">500+</div>
                <div className="text-xs lg:text-sm text-white/60 font-medium">Case Studies</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-white">95%</div>
                <div className="text-xs lg:text-sm text-white/60 font-medium">Success Rate</div>
              </div>
            </div>
            <p className="text-white/50 text-xs lg:text-sm leading-relaxed">
              Transform your finance career with gamified learning
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;