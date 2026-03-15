import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Github, Chrome } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const navigate = useNavigate();
  const { setUser, setToken, setIsPreparing } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { email, password, username, secret };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      if (isLogin) {
        setToken(data.token);
        setUser(data.user);
        
        // Show 15-second loading screen
        setIsPreparing(true);
        setTimeout(() => {
          setIsPreparing(false);
          navigate("/");
        }, 15000);
      } else {
        setIsLogin(true);
        alert("Registration successful! Please login.");
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-white/40 text-sm">
            {isLogin ? "Login to access your premium library" : "Join the ultimate anime community"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
          )}

          {isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="Enter your email or username"
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Secret Key (Optional)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="password" 
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="Owner Secret"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-primary text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/80 transition-all group">
            {isLogin ? "Login" : "Register"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 space-y-6">
          <p className="text-center text-sm text-white/40">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
