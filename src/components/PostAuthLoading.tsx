import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, ShieldCheck, Tv, Film, Crown } from "lucide-react";
import { useStore } from "../store/useStore";

interface PostAuthLoadingProps {
  onComplete: () => void;
}

export default function PostAuthLoading({ onComplete }: PostAuthLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const { user } = useStore();

  const steps = [
    { text: "Authenticating Session...", icon: ShieldCheck },
    { text: "Preparing Your Library...", icon: Tv },
    { text: "Optimizing Stream Quality...", icon: Sparkles },
    { text: "Syncing Watch History...", icon: Film },
    { text: "Finalizing Your Experience...", icon: Crown },
  ];

  useEffect(() => {
    const duration = 15000; // 15 seconds
    const intervalTime = 100;
    const increment = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const stepInterval = 15000 / steps.length;
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, stepInterval);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-12 text-center space-y-10 relative z-10"
      >
        <div className="space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-white/5 stroke-current"
                strokeWidth="4"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
              />
              <motion.circle
                className="text-primary stroke-current"
                strokeWidth="4"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${(progress * 283) / 100} 283` }}
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                  className="text-primary"
                >
                  {React.createElement(steps[step].icon, { size: 32 })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">
              Welcome, {user?.name}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                {steps[step].text}
              </span>
              <Loader2 size={12} className="animate-spin text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
            <span>System Status</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">Access Level</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                  user?.role === 'OWNER' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  user?.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                  user?.isVip ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                  'bg-white/10 text-white/40 border-white/10'
                }`}>
                  {user?.role === 'OWNER' ? 'OWNER' : 
                   user?.role === 'ADMIN' ? 'ADMIN' : 
                   user?.isVip ? 'VIP MEMBER' : 'FREE USER'}
                </span>
                {user?.isVip && <Crown size={12} className="text-yellow-500" fill="currentColor" />}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
