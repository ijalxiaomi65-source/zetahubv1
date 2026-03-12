import React, { useEffect, useState } from "react";
import { fetchTrending, fetchPopular, fetchTrendingDonghua, fetchPopularDonghua, fetchTrendingKdrama } from "../lib/api";
import { Link } from "react-router-dom";
import { Play, Star, ChevronRight, Clock, Crown, TrendingUp, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SectionSkeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [donghua, setDonghua] = useState<any[]>([]);
  const [kdrama, setKdrama] = useState<any[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<any[]>([]);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load history
        const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");
        setWatchHistory(history);

        // Staggered loading for better performance
        const t = await fetchTrending();
        setTrending(t);
        
        await new Promise(r => setTimeout(r, 500));
        const p = await fetchPopular();
        setPopular(p);
        
        await new Promise(r => setTimeout(r, 500));
        const d = await fetchTrendingDonghua();
        setDonghua(d);

        await new Promise(r => setTimeout(r, 500));
        const k = await fetchTrendingKdrama();
        setKdrama(k.slice(0, 12));

        // Fetch Nekosia preview
        try {
          const res = await fetch("https://api.nekosia.cat/api/v1/images/random?count=6");
          const data = await res.json();
          if (data.success) {
            setGalleryPreview(Array.isArray(data) ? data : [data]);
          }
        } catch (e) {
          console.error("Nekosia preview error:", e);
        }
        
      } catch (err: any) {
        console.error("Home load error:", err);
        setError("Failed to load content. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <Star size={40} className="text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tighter">Something went wrong</h2>
          <p className="text-white/40 max-w-md">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-20">
      <LoadingBar isLoading={loading} />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center px-6 sm:px-12 overflow-hidden">
        {trending[0] && (
          <>
            <div className="absolute inset-0 z-0">
              <img 
                src={trending[0].bannerImage || trending[0].coverImage.extraLarge || null} 
                className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
                alt="Hero"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10 max-w-3xl space-y-8"
            >
              <div className="flex items-center gap-3">
                <span className="bg-primary text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">#1 Trending</span>
                <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                  <Star size={16} fill="currentColor" />
                  {trending[0].averageScore / 10}
                </div>
              </div>
              <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none">
                {trending[0].title.english || trending[0].title.romaji}
              </h1>
              <p className="text-lg text-white/60 line-clamp-3 max-w-xl leading-relaxed" dangerouslySetInnerHTML={{ __html: trending[0].description }} />
              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  to={`/anime/${trending[0].id}`}
                  className="bg-primary text-black px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
                >
                  <Play size={24} fill="currentColor" /> WATCH NOW
                </Link>
                <button className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
                  + WATCHLIST
                </button>
              </div>
            </motion.div>
          </>
        )}
      </section>

      <div className="px-6 sm:px-12 max-w-[1800px] mx-auto space-y-24 -mt-20 relative z-10">
        
        {/* Continue Watching */}
        {watchHistory.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                Continue Watching <Clock size={24} className="text-primary" />
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {watchHistory.map((item) => (
                <Link 
                  key={item.animeId} 
                  to={`/watch/${item.animeId}/${item.episode}`}
                  className="glass-card group flex gap-4 p-4 hover:border-primary/50 transition-all"
                >
                  <div className="w-24 aspect-[2/3] rounded-xl overflow-hidden shrink-0">
                    <img src={item.animeCover || null} className="w-full h-full object-cover" alt={item.animeTitle} />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.animeTitle}</h3>
                      <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Episode {item.episode}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.min(100, (item.timestamp / (item.duration || 1440)) * 100)}%` }} 
                        />
                      </div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Resume Playback</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Anime */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              Trending Anime <TrendingUp size={24} className="text-primary" />
            </h2>
          </div>
          {loading && trending.length === 0 ? (
            <SectionSkeleton title="Trending Anime" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {trending.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.05 }} className="group">
                  <Link to={`/anime/${item.id}`}>
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl">
                      <img src={item.coverImage.large || null} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title.english} />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black border border-white/10 flex items-center gap-1">
                        <Star size={10} className="text-yellow-500" fill="currentColor" />
                        {item.averageScore / 10}
                      </div>
                    </div>
                    <div className="mt-4 space-y-1">
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title.english || item.title.romaji}</h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">{item.genres[0]} • {item.genres[1] || "Action"}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* K-Drama Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              K-Drama Updates <Crown size={24} className="text-primary" />
            </h2>
            <Link to="/kdrama" className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          {loading && kdrama.length === 0 ? (
            <SectionSkeleton title="K-Drama Updates" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {kdrama.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.05 }} className="group">
                  <Link to={`/kdrama/${item.id}`}>
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl">
                      <img src={item.image || null} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                      <div className="absolute bottom-3 left-3 bg-primary text-black text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">
                        NEW EPISODE
                      </div>
                    </div>
                    <div className="mt-4 space-y-1">
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">Korean Drama • {item.releaseDate || "2026"}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Wallpaper Gallery Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                Anime Wallpapers <ImageIcon size={24} className="text-primary" />
              </h2>
              <p className="text-white/40 text-sm font-medium">High-quality illustrations powered by Nekosia</p>
            </div>
            <Link to="/gallery" className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
              Explore Gallery <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryPreview.length > 0 ? (
              galleryPreview.map((img, idx) => (
                <motion.div 
                  key={img.id || idx}
                  whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 1 : -1 }}
                  className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 group relative"
                >
                  <img 
                    src={img.image?.compressed?.url || img.image?.original?.url || null} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                    alt="Gallery Preview"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))
            ) : (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
              ))
            )}
          </div>
        </section>

        {/* Donghua Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter">Trending Donghua</h2>
          </div>
          {loading && donghua.length === 0 ? (
            <SectionSkeleton title="Trending Donghua" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {donghua.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.05 }} className="group">
                  <Link to={`/anime/${item.id}`}>
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl">
                      <img src={item.coverImage.large || null} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title.english} />
                    </div>
                    <div className="mt-4 space-y-1">
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title.english || item.title.romaji || item.title.native}</h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">CN • {item.genres[0]}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
