import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, Shield, Star, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function PreparingScreen() {
  const { user } = useStore();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing secure connection...');

  const messages = [
    'Initializing secure connection...',
    'Loading your personalized library...',
    'Checking premium status...',
    'Syncing watch history...',
    'Optimizing streaming quality...',
    'Almost ready for takeoff...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / 15); // 15 seconds
      });
    }, 1000);

    const messageInterval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-center justify-center items-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 shadow-2xl shadow-primary/20"
        >
          <Play className="text-primary fill-primary" size={40} />
        </motion.div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white mb-2">
              Preparing Your Experience
            </h2>
            <div className="flex items-center justify-center gap-2 text-white/40 text-sm font-medium uppercase tracking-widest">
              {user?.role === 'OWNER' && <Shield size={14} className="text-red-500" />}
              {user?.role === 'ADMIN' && <Shield size={14} className="text-blue-500" />}
              {user?.isVip && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
              <span>
                {user?.role} {user?.isVip && '• VIP'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={message}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white/60 text-sm font-medium h-5"
              >
                {message}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="pt-8 flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                <Zap size={20} />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-white/20">Fast</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                <Shield size={20} />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-white/20">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                <Star size={20} />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-white/20">Premium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
