import React, { useState, useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Shield, TrendingUp, Award, Zap } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsSignup(params.get('mode') === 'signup');
  }, []);

  /* Premium Glass Appearance Configuration */
  const glassAppearance = {
    layout: {
      socialButtonsPlacement: 'top' as const,
      socialButtonsVariant: 'blockButton' as const,
    },
    variables: {
      colorBackground: 'transparent',
      colorText: 'white',
      colorPrimary: '#818cf8', // Indigo-400
      colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
      colorInputBackground: 'rgba(255, 255, 255, 0.05)',
      colorInputText: 'white',
      borderRadius: '1rem',
      fontFamily: '"Outfit", sans-serif',
    },
    elements: {
      // Remove any inner box/card visuals so it's purely content
      rootBox: "w-full !bg-transparent !shadow-none !border-none p-0 !min-w-0",
      card: "w-full !bg-transparent !shadow-none !border-none p-0 !min-w-0",

      // Header styling - Sync fonts
      headerTitle: "text-white font-bold text-2xl tracking-tight font-sans",
      headerSubtitle: "text-indigo-200 text-sm font-medium font-sans",

      // Social buttons
      socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300 h-10 font-sans",
      socialButtonsBlockButtonText: "text-white font-medium text-sm",
      socialButtonsBlockButtonArrow: "text-indigo-400",
      socialButtonsBlockButtonBadge: "!hidden invisible display-none", // Force hide with multiple strategies

      // Divider
      dividerLine: "bg-white/10",
      dividerText: "text-white/40 uppercase text-xs tracking-widest font-sans",

      // Form fields
      formFieldLabel: "text-indigo-100 text-xs font-semibold uppercase tracking-wide ml-1 mb-1.5 font-sans",
      formFieldInput: "bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-indigo-500/50 focus:ring-indigo-500/20 focus:bg-white/10 transition-all duration-300 rounded-xl h-12 font-sans",

      // Footer/Links
      footerActionText: "text-white/50",
      footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold",

      // Primary Button
      formButtonPrimary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 border-none shadow-lg shadow-indigo-500/20 text-white font-bold tracking-wide uppercase text-sm h-12 transition-all duration-300 bg-[length:200%_auto] hover:bg-right font-sans",

      identityPreviewText: "text-white",
      identityPreviewEditButton: "text-indigo-400 hover:text-indigo-300",
      footer: "hidden",
      main: "gap-6",
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1e1b4b] to-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <style>{`
        /* NUCLEAR OPTION: Force All Clerk Containers to be Transparent */
        .cl-card, 
        .cl-rootBox, 
        .cl-main, 
        .cl-header, 
        .cl-component,
        .cl-signIn-start,
        .cl-signUp-start,
        .cl-card > div,
        .cl-rootBox > div {
          background-color: transparent !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        
        /* Force Hide "Last Used" Badge */
        .cl-socialButtonsBlockButtonBadge, 
        .cl-badge, 
        span[class*="badge"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Hide default footer */
        .cl-footer {
          display: none !important;
        }
        
        /* Ensure specific inputs still have their intended style */
        .cl-formFieldInput {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>

      {/* Animated Background Elements - Smoother & More Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] opacity-30 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Floating Icons - Subtle movement */}
      <div className="absolute inset-0 pointer-events-none">
        <TrendingUp className="absolute top-[15%] left-[10%] w-8 h-8 text-indigo-400/20 animate-bounce delay-0 duration-[3000ms]" />
        <Award className="absolute top-[25%] right-[15%] w-6 h-6 text-purple-400/20 animate-bounce delay-1000 duration-[4000ms]" />
        <Zap className="absolute bottom-[20%] left-[15%] w-7 h-7 text-yellow-400/20 animate-bounce delay-2000 duration-[3500ms]" />
        <Shield className="absolute bottom-[25%] right-[10%] w-9 h-9 text-blue-400/20 animate-bounce delay-500 duration-[4500ms]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full mx-auto px-6 md:px-0">
        {/* Branding Header - Tighter Integration */}
        <div className="text-center mb-6 md:mb-8 transform hover:scale-105 transition-transform duration-500 cursor-default">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/20 border border-white/10 backdrop-blur-sm group">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white drop-shadow-sm tracking-tight mb-1">
            Finopoly
          </h1>
          <p className="text-indigo-200/60 text-xs md:text-sm font-medium tracking-wide uppercase">Master Finance Through Play</p>
        </div>

        {/* Unified Glass Card Container */}
        <div className="w-full bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 overflow-hidden relative group">

          {/* Subtle automated glow effect on hover */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div className="w-full">
            {isSignup ? (
              <SignUp
                appearance={glassAppearance}
                signInUrl="/?mode=login"
              />
            ) : (
              <SignIn
                appearance={glassAppearance}
                signUpUrl="/?mode=signup"
              />
            )}
          </div>

          {/* Integrated Footer - Now inside the card */}
          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
            <p className="text-indigo-200/60 text-sm font-medium">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                const newMode = isSignup ? 'login' : 'signup';
                window.history.pushState({}, '', `/?mode=${newMode}`);
                setIsSignup(!isSignup);
              }}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/5 hover:border-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
            >
              {isSignup ? (
                <>Key into the Vault <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span></>
              ) : (
                <>Create new Account <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span></>
              )}
            </button>
          </div>
        </div>

        {/* Bottom copyright/trust seal */}
        <p className="mt-8 text-white/20 text-xs font-medium tracking-widest uppercase">
          Secured by Clerk • 2024 Finopoly
        </p>
      </div>
    </div>
  );
};
export default LoginPage;