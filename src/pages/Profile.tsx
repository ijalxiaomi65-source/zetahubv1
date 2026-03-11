import React, { useState, useEffect } from "react";
import { User, Crown, History, Heart, Settings, Shield, Play, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const localUser = JSON.parse(localStorage.getItem("user") || "null");
      const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");
      setWatchHistory(history);
      
      if (localUser) {
        setUser(localUser);
      }

      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          }
        }
      } catch (e) {
        console.error("Profile fetch error:", e);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Profile...</div>;
  if (!user) return <div className="h-screen flex items-center justify-center">Please login to view profile.</div>;

  return (
    <div className="pt-32 px-6 sm:px-12 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div className="flex gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-bold hover:underline">
            <ArrowLeft size={18} /> Back
          </button>
          <Link to="/" className="flex items-center gap-2 text-white/40 font-bold hover:text-white transition-all">
            <Home size={18} /> Home
          </Link>
        </div>
        <h1 className="text-2xl font-black tracking-tighter uppercase opacity-20">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-8 text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto flex items-center justify-center border-2 border-primary/30 relative">
              <User size={48} className="text-primary" />
              {user.isVip && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 p-1.5 rounded-full border-4 border-[var(--bg)]">
                  <Crown size={16} className="text-black" fill="currentColor" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter">{user.name}</h2>
              <p className="text-muted text-sm">{user.email}</p>
            </div>
            <div className="flex justify-center gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border border-primary/20">{user.role}</span>
              {user.isVerified && <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border border-blue-500/20">Verified</span>}
            </div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary text-black font-bold">
              <User size={20} /> Profile Overview
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-muted font-bold">
              <History size={20} /> Watch History
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-muted font-bold">
              <Heart size={20} /> My Watchlist
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-muted font-bold">
              <Settings size={20} /> Settings
            </button>
            {user.role === "OWNER" && (
              <Link to="/admin" className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-500/10 transition-all text-red-500 font-bold">
                <Shield size={20} /> Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 space-y-2">
              <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Watch Time</p>
              <p className="text-3xl font-black tracking-tighter">124 <span className="text-sm font-normal text-white/40">Hours</span></p>
            </div>
            <div className="glass-card p-8 space-y-2">
              <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Completed</p>
              <p className="text-3xl font-black tracking-tighter">42 <span className="text-sm font-normal text-white/40">Anime</span></p>
            </div>
            <div className="glass-card p-8 space-y-2">
              <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Comments</p>
              <p className="text-3xl font-black tracking-tighter">89 <span className="text-sm font-normal text-white/40">Posts</span></p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
              Continue Watching <History size={20} className="text-primary" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchHistory.length > 0 ? (
                watchHistory.map((item: any) => {
                  const progress = (item.timestamp / item.duration) * 100;
                  const timeLeft = Math.max(0, Math.floor((item.duration - item.timestamp) / 60));
                  
                  return (
                    <Link 
                      key={`${item.animeId}-${item.episode}`}
                      to={`/watch/${item.animeId}/${item.episode}`}
                      className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10"
                    >
                      <img src={item.animeCover} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" alt={item.animeTitle} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="font-bold line-clamp-1">{item.animeTitle}</h4>
                        <p className="text-xs text-white/60">Episode {item.episode} • {timeLeft}m left</p>
                        <div className="w-full h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black">
                          <Play size={24} fill="currentColor" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center bg-white/5 rounded-2xl border border-white/5 border-dashed">
                  <Play size={48} className="mx-auto text-white/10 mb-4" />
                  <p className="text-white/40 font-bold">No watch history yet. Start watching some anime!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
