import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchDetails } from "../lib/api";
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
          const data = await fetchDetails(id);
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
          src={anime.bannerImage || anime.coverImage.extraLarge} 
          className="w-full h-full object-cover"
          alt={anime.title.english}
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
              <img src={anime.coverImage.extraLarge} className="w-full h-full object-cover" alt={anime.title.english} />
            </div>
            
            <div className="mt-8 space-y-4">
              <Link to={`/watch/${anime.id}/1`} className="w-full bg-primary text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all">
                <Play size={20} fill="currentColor" /> Watch Now
              </Link>
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
                  <Star size={18} fill="currentColor" /> {anime.averageScore / 10}
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="text-muted font-medium">{anime.seasonYear}</div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="text-muted font-medium uppercase tracking-widest text-xs">{anime.status}</div>
              </div>

              <h1 className="text-5xl font-black tracking-tighter mb-4 leading-tight">
                {anime.title.english || anime.title.romaji || anime.title.native}
              </h1>
              <p className="text-muted text-lg italic mb-8">{anime.title.native}</p>

              <div className="flex flex-wrap gap-2 mb-10">
                {anime.genres.map((g: string) => (
                  <span key={g} className="px-4 py-1.5 rounded-full glass-card text-xs font-bold text-muted">
                    {g}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
                <div className="space-y-1">
                  <p className="text-muted text-[10px] uppercase font-black tracking-widest">Episodes</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Tv size={16} className="text-primary" /> {anime.episodes || "??"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted text-[10px] uppercase font-black tracking-widest">Studio</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Clock size={16} className="text-primary" /> {anime.studios.nodes[0]?.name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted text-[10px] uppercase font-black tracking-widest">Type</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Tv size={16} className="text-primary" /> TV Series</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted text-[10px] uppercase font-black tracking-widest">Rating</p>
                  <p className="text-lg font-bold flex items-center gap-2"><Star size={16} className="text-primary" /> PG-13</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Synopsis</h3>
                <div className="text-muted leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: anime.description }} />
              </div>

              {/* Characters */}
              {anime.characters?.nodes?.length > 0 && (
                <div className="mt-12 space-y-6">
                  <h3 className="text-xl font-bold tracking-tight">Main Characters</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {anime.characters.nodes.map((char: any) => (
                      <div key={char.id} className="space-y-2 text-center">
                        <div className="aspect-square rounded-full overflow-hidden border border-white/10">
                          <img src={char.image.large} className="w-full h-full object-cover" alt={char.name.full} />
                        </div>
                        <p className="text-[10px] font-bold line-clamp-1">{char.name.full}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Relations / Seasons */}
        {anime.relations?.edges?.length > 0 && (
          <div className="mt-24 space-y-8">
            <h2 className="text-3xl font-black tracking-tighter">Related Content / Seasons</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {anime.relations.edges.filter((e: any) => e.node.type === "ANIME").map((rel: any) => (
                <Link 
                  key={rel.node.id} 
                  to={`/anime/${rel.node.id}`}
                  className="group space-y-3"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 relative">
                    <img 
                      src={rel.node.coverImage.large} 
                      alt={rel.node.title.english} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <Play size={32} className="text-primary" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-black/60 backdrop-blur-md text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest border border-white/10">
                        {rel.relationType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold line-clamp-1 group-hover:text-primary transition-all">
                      {rel.node.title.english || rel.node.title.romaji || rel.node.title.native}
                    </p>
                    <p className="text-[10px] text-muted uppercase tracking-widest mt-1">{rel.node.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Episodes List */}
        <div className="mt-24 space-y-8">
          <h2 className="text-3xl font-black tracking-tighter">Episodes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: anime.episodes || 12 }).map((_, i) => (
              <Link 
                key={i} 
                to={`/watch/${anime.id}/${i + 1}`}
                className="group glass-card p-4 flex items-center justify-between hover:bg-primary hover:border-primary transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-muted group-hover:text-black/40 italic">{(i + 1).toString().padStart(2, '0')}</span>
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
