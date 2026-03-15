import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAnimeInfoGogo } from "../lib/api";
import { Play, Plus, Star, Calendar, Clock, Tv } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";

export default function Details() {
  const { id } = useParams();
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await fetchAnimeInfoGogo(id);
          setAnime(data);
        } catch (err: any) {
          setError(err.message || "Failed to load anime details");
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

  if (loading && !anime) {
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

  if (!anime) return <div className="h-screen flex items-center justify-center">Anime not found</div>;

  return (
    <div className="relative">
      <LoadingBar isLoading={loading} />
      {/* Banner */}
      <div className="h-[60vh] relative overflow-hidden">
        <img 
          src={anime.image || null} 
          className="w-full h-full object-cover blur-sm opacity-50"
          alt={anime.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-72 shrink-0"
          >
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img src={anime.image || null} className="w-full h-full object-cover" alt={anime.title} />
            </div>
            
            <div className="mt-8 space-y-4">
              {anime.episodes?.length > 0 && (
                <Link to={`/watch/${anime.id}/${anime.episodes[0].number}`} className="w-full bg-primary text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all">
                  <Play size={20} fill="currentColor" /> Watch Now
                </Link>
              )}
              <button className="w-full glass-card py-4 font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                <Plus size={20} /> Add to Watchlist
              </button>
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-grow pt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Star size={18} fill="currentColor" /> {anime.type}
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="text-muted font-medium">{anime.releaseDate}</div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="text-muted font-medium uppercase tracking-widest text-xs">{anime.status}</div>
              </div>

              <h1 className="text-5xl font-black tracking-tighter mb-4 leading-tight">
                {anime.title}
              </h1>
              <p className="text-muted text-lg italic mb-8">{anime.otherName}</p>

              <div className="flex flex-wrap gap-2 mb-10">
                {anime.genres?.map((g: string) => (
                  <span key={g} className="px-4 py-1.5 rounded-full glass-card text-xs font-bold text-muted">
                    {g}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
                <div className="space-y-1">
                  <p className="text-muted text-[10px] uppercase font-black tracking-widest">Episodes</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Tv size={16} className="text-primary" /> {anime.totalEpisodes || "??"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted text-[10px] uppercase font-black tracking-widest">Sub/Dub</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Clock size={16} className="text-primary" /> {anime.subOrDub || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted text-[10px] uppercase font-black tracking-widest">Type</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Tv size={16} className="text-primary" /> {anime.type || "TV"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted text-[10px] uppercase font-black tracking-widest">Status</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Star size={16} className="text-primary" /> {anime.status}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Synopsis</h3>
                <div className="text-muted leading-relaxed text-lg">
                  {anime.description}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Episodes List */}
        <div className="mt-24 space-y-8">
          <h2 className="text-3xl font-black tracking-tighter">Episodes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {anime.episodes?.map((ep: any) => (
              <Link 
                key={ep.id} 
                to={`/watch/${anime.id}/${ep.number}`}
                className="group glass-card p-4 flex items-center justify-between hover:bg-primary hover:border-primary transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-muted group-hover:text-black/40 italic">{ep.number.toString().padStart(2, '0')}</span>
                  <span className="font-bold group-hover:text-black">Episode {ep.number}</span>
                </div>
                <Play size={16} className="text-primary group-hover:text-black" fill="currentColor" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
