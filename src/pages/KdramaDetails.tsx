import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchKdramaDetails } from "../lib/api";
import { Play, Plus, Star, Calendar, Clock, Tv, User, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";

export default function KdramaDetails() {
  const { id } = useParams();
  const [drama, setDrama] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await fetchKdramaDetails(id);
          setDrama(data);
        } catch (err: any) {
          setError(err.message || "Failed to load K-Drama details");
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [id]);

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-500 font-bold">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-primary text-black rounded-lg font-bold"
      >
        Retry
      </button>
    </div>
  );

  if (loading && !drama) {
    return (
      <div className="relative">
        <LoadingBar isLoading={loading} />
        <div className="h-[60vh] bg-white/5 animate-pulse" />
        <div className="max-w-7xl mx-auto px-6 sm:px-12 -mt-40 relative z-10">
          <div className="flex flex-col md:flex-row gap-12">
            <Skeleton className="w-full md:w-72 aspect-[2/3] rounded-2xl" />
            <div className="flex-grow pt-20 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!drama) return <div className="h-screen flex items-center justify-center">K-Drama not found</div>;

  return (
    <div className="relative">
      <LoadingBar isLoading={loading} />
      
      {/* Banner */}
      <div className="h-[60vh] relative overflow-hidden">
        <motion.img 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          src={drama.cover || drama.image || null} 
          className="w-full h-full object-cover"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/90 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-80 shrink-0"
          >
            <div className="aspect-[2/3] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative group">
              <img src={drama.image || null} className="w-full h-full object-cover" alt={drama.title} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <Play size={64} className="text-primary" />
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <Link 
                to={`/kdrama/watch/${drama.id}/${drama.episodes?.[0]?.id}`}
                className="w-full bg-primary text-black py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                <Play size={24} fill="currentColor" /> WATCH NOW
              </Link>
              <button className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                <Plus size={24} /> ADD TO WATCHLIST
              </button>
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-grow pt-20 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/30">K-Drama</span>
                <span className="bg-white/5 text-white/60 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">{drama.type || "Series"}</span>
                <div className="flex items-center gap-1 text-yellow-500 font-black text-sm ml-2">
                  <Star size={16} fill="currentColor" />
                  {drama.status || "Ongoing"}
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{drama.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-white/40 uppercase tracking-widest">
                <div className="flex items-center gap-2"><Calendar size={16} /> {drama.releaseDate || "2026"}</div>
                <div className="flex items-center gap-2"><Tv size={16} /> {drama.episodes?.length || 0} Episodes</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {drama.genres?.map((genre: string) => (
                <span key={genre} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all cursor-pointer">
                  {genre}
                </span>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
                <Info size={20} className="text-primary" /> Synopsis
              </h3>
              <p className="text-lg text-white/60 leading-relaxed max-w-4xl" dangerouslySetInnerHTML={{ __html: drama.description }} />
            </div>

            {/* Episodes List */}
            <div className="space-y-6 pt-8">
              <h3 className="text-2xl font-black tracking-tighter">Episodes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {drama.episodes?.map((ep: any) => (
                  <Link 
                    key={ep.id} 
                    to={`/kdrama/watch/${drama.id}/${ep.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 group-hover:bg-primary group-hover:text-black transition-all">
                      <Play size={20} fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Episode {ep.number}</p>
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Available in HD</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
