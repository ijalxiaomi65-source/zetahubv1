import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Loader2, CheckCircle2 } from "lucide-react";

interface HumanVerificationProps {
  onVerify: () => void;
}

export default function HumanVerification({ onVerify }: HumanVerificationProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "language" | "success">("loading");
  const [progress, setProgress] = useState(0);
  const [networkInfo, setNetworkInfo] = useState<{ ip: string; type: string; region: string }>({ ip: "Detecting...", type: "Analyzing...", region: "Locating..." });
  const [securityStep, setSecurityStep] = useState("Initializing Security...");

  useEffect(() => {
    // Fetch IP, Network Info, and Region
    const fetchNetInfo = async () => {
      try {
        // Using ipapi.co for more detailed info including region
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        
        // Get connection type if available
        const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const type = conn ? `${conn.effectiveType || "Unknown"} ${conn.type || ""}` : "Broadband/WiFi";
        
        setNetworkInfo({ 
          ip: data.ip || "127.0.0.1", 
          type: type.trim(),
          region: data.country_name ? `${data.city ? data.city + ", " : ""}${data.country_name}` : "Global"
        });
      } catch (e) {
        setNetworkInfo({ ip: "127.0.0.1", type: "Secure Tunnel", region: "Unknown Region" });
      }
    };
    fetchNetInfo();

    if (status === "loading") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus("ready");
            return 100;
          }
          
          if (prev < 20) setSecurityStep("Initializing Security...");
          else if (prev < 40) setSecurityStep("Scanning Local Environment...");
          else if (prev < 60) setSecurityStep("Verifying Proxy Servers...");
          else if (prev < 80) setSecurityStep("Checking Network Integrity...");
          else setSecurityStep("Finalizing Handshake...");
          
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleVerify = () => {
    setStatus("verifying");
    setSecurityStep("Analyzing browser patterns...");
    
    setTimeout(() => {
      setSecurityStep("Verifying Proxy Tunnel...");
      setTimeout(() => {
        setSecurityStep("Validating IP Signature...");
        setTimeout(() => {
          setStatus("language");
          setSecurityStep("Select Language");
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleLanguageSelect = (lang: string) => {
    localStorage.setItem("zeta_lang", lang);
    setStatus("success");
    setSecurityStep("Access Granted");
    setTimeout(() => {
      onVerify();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 text-center space-y-8 relative border-white/10"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <AnimatePresence mode="wait">
              {status === "loading" || status === "verifying" ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="text-primary animate-spin" size={40} />
                </motion.div>
              ) : status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <CheckCircle2 className="text-green-500" size={40} />
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <ShieldCheck className="text-primary" size={40} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-white">ZETAHUB SECURITY</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
              {securityStep}
            </p>
          </div>
        </div>

        {/* Network Info Panel */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-left">
              <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">IP Address</p>
              <p className="text-xs font-mono text-primary truncate">{networkInfo.ip}</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-left">
              <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">Network Type</p>
              <p className="text-xs font-mono text-primary truncate">{networkInfo.type}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-left">
            <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">Detected Region</p>
            <p className="text-xs font-mono text-primary truncate">{networkInfo.region}</p>
          </div>
        </div>

        <div className="space-y-6">
          {status === "loading" ? (
            <div className="space-y-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
                System Integrity Check... {progress}%
              </p>
            </div>
          ) : status === "verifying" ? (
            <div className="py-4 flex flex-col items-center gap-4">
              <p className="text-white/60 text-sm italic">Analyzing proxy signatures...</p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ))}
              </div>
            </div>
          ) : status === "language" ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Choose Your Interface Language</p>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleLanguageSelect("id")}
                  className="w-full bg-white/5 border border-white/10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary hover:text-black transition-all group"
                >
                  <span className="text-lg">🇮🇩</span> Bahasa Indonesia
                </button>
                <button 
                  onClick={() => handleLanguageSelect("en")}
                  className="w-full bg-white/5 border border-white/10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary hover:text-black transition-all group"
                >
                  <span className="text-lg">🇺🇸</span> English (US)
                </button>
                <button 
                  onClick={() => handleLanguageSelect("jp")}
                  className="w-full bg-white/5 border border-white/10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary hover:text-black transition-all group"
                >
                  <span className="text-lg">🇯🇵</span> 日本語 (Japanese)
                </button>
              </div>
            </motion.div>
          ) : status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <p className="text-green-500 font-bold text-lg">Verification Successful</p>
              <p className="text-white/40 text-xs mt-1">Redirecting to ZetaHub...</p>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              className="w-full bg-primary text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Lock size={20} /> VERIFY I AM HUMAN
            </motion.button>
          )}
        </div>

        <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest leading-relaxed">
            Proxy Verification: <span className="text-primary">ACTIVE</span><br />
            &copy; 2026 ZETAHUB PREMIUM
          </p>
        </div>
      </motion.div>
    </div>
  );
}
