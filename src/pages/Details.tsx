import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchDetails } from "../lib/api";
import { Play, Plus, Star, Calendar, Clock, Tv } from "lucide-react";
import { motion } from "framer-motion";

export default function Details() {
  const { id } = useParams();
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const data = await fetchDetails(id);
        setAnime(data);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-[60vh] relative overflow-hidden">
        <img 
          src={anime.bannerImage || anime.coverImage.extraLarge} 
          className="w-full h-full object-cover"
          alt={anime.title.english}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-12 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-72 shrink-0"
          >
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img src={anime.coverImage.extraLarge} className="w-full h-full object-cover" alt={anime.title.english} />
            </div>
            
            <div className="mt-8 space-y-4">
              <Link to={`/watch/${anime.id}/1`} className="w-full bg-primary text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/80 transition-all">
                <Play size={20} fill="currentColor" /> Watch Now
              </Link>
              <button className="w-full bg-white/5 backdrop-blur-md text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10">
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
                  <Star size={18} fill="currentColor" /> {anime.averageScore / 10}
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="text-white/60 font-medium">{anime.seasonYear}</div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="text-white/60 font-medium uppercase tracking-widest text-xs">{anime.status}</div>
              </div>

              <h1 className="text-5xl font-black tracking-tighter mb-4 leading-tight">
                {anime.title.english || anime.title.romaji}
              </h1>
              <p className="text-white/40 text-lg italic mb-8">{anime.title.native}</p>

              <div className="flex flex-wrap gap-2 mb-10">
                {anime.genres.map((g: string) => (
                  <span key={g} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70">
                    {g}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
                <div className="space-y-1">
                  <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Episodes</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Tv size={16} className="text-primary" /> {anime.episodes || "??"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Studio</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Clock size={16} className="text-primary" /> {anime.studios.nodes[0]?.name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Type</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Tv size={16} className="text-primary" /> TV Series</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Rating</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Star size={16} className="text-primary" /> PG-13</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Synopsis</h3>
                <div className="text-white/60 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: anime.description }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Episodes List */}
        <div className="mt-24 space-y-8">
          <h2 className="text-3xl font-black tracking-tighter">Episodes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: anime.episodes || 12 }).map((_, i) => (
              <Link 
                key={i} 
                to={`/watch/${anime.id}/${i + 1}`}
                className="group bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-primary hover:border-primary transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-white/20 group-hover:text-black/40 italic">{(i + 1).toString().padStart(2, '0')}</span>
                  <span className="font-bold group-hover:text-black">Episode {i + 1}</span>
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
