import React, { useEffect, useState } from "react";
import { 
  fetchTopAiringAnime, 
  fetchTrendingDonghua, 
  fetchTrendingKdramaTMDB,
  fetchPopularKdramaTMDB,
  fetchPopularDonghua
} from "../lib/api";
import { Link } from "react-router-dom";
import { 
  Play, 
  Star, 
  ChevronRight, 
  Clock, 
  Crown, 
  TrendingUp, 
  Image as ImageIcon,
  Zap,
  Plus,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { SectionSkeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";
import { ContentCard } from "../components/ContentCard";
import { ContentRow } from "../components/ContentRow";
import { getAIRecommendations } from "../services/geminiService";

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [donghua, setDonghua] = useState<any[]>([]);
  const [kdrama, setKdrama] = useState<any[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<any[]>([]);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [aiRecs, setAiRecs] = useState<any[]>([]);
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

        // Fetch AI recommendations if history exists
        if (history.length > 0) {
          getAIRecommendations(history).then(setAiRecs);
        }

        // Fetch data from new sources with allSettled
        const results = await Promise.allSettled([
          fetchTopAiringAnime(),
          fetchTrendingDonghua(),
          fetchTrendingKdramaTMDB(),
          fetchPopularKdramaTMDB(),
          fetchPopularDonghua()
        ]);

        const [trendingRes, donghuaRes, kdramaRes, popularKdramaRes, popularDonghuaRes] = results;

        if (trendingRes.status === "fulfilled") setTrending(trendingRes.value.slice(0, 15));
        if (donghuaRes.status === "fulfilled") setDonghua(donghuaRes.value.slice(0, 15));
        if (kdramaRes.status === "fulfilled") setKdrama(kdramaRes.value.slice(0, 15));
        
        // If all major ones failed, show error
        if (trendingRes.status === "rejected" && donghuaRes.status === "rejected" && kdramaRes.status === "rejected") {
          setError("Failed to load content. Please check your API keys and connection.");
        }

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
        setError("Failed to load content. Please check your API keys and connection.");
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

  const heroItem = trending[0];

  return (
    <div className="pb-20 space-y-12">
      <LoadingBar isLoading={loading} />
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center px-6 sm:px-12 overflow-hidden">
        {heroItem && (
          <>
            <div className="absolute inset-0 z-0">
              <img 
                src={heroItem.image} 
                className="w-full h-full object-cover opacity-50 scale-105 animate-slow-zoom"
                alt="Hero"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-3xl space-y-6 mt-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-primary/30">
                  Trending Now
                </span>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                  <Star size={14} fill="currentColor" />
                  {heroItem.rating || "8.5"}
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-7xl font-black tracking-tighter leading-none"
              >
                {heroItem.title}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/60 line-clamp-3 max-w-xl font-medium"
              >
                {heroItem.description || "Experience the latest and most popular content on ZetaHub. Stream in high definition with seamless playback and advanced features."}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-4"
              >
                <Link 
                  to={`/anime/${heroItem.id}`}
                  className="bg-primary text-black px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  <Play size={20} fill="currentColor" /> Watch Now
                </Link>
                <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-white/20 transition-all border border-white/10">
                  <Plus size={20} /> My List
                </button>
              </motion.div>
            </div>
          </>
        )}
      </section>

      <div className="space-y-16 -mt-32 relative z-20">
        {/* Continue Watching */}
        {watchHistory.length > 0 && (
          <ContentRow title="Continue Watching" icon={<Clock size={24} className="text-primary" />}>
            {watchHistory.map((item) => (
              <Link 
                key={item.animeId} 
                to={`/watch/${item.animeId}/${item.episodeNum}`}
                className="glass-card group flex gap-4 p-4 hover:border-primary/50 transition-all w-80 shrink-0"
              >
                <div className="w-24 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-white/5">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                </div>
                <div className="flex flex-col justify-between py-1 overflow-hidden">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Episode {item.episodeNum}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(100, (item.progress / (item.duration || 1)) * 100)}%` }} 
                      />
                    </div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Resume</p>
                  </div>
                </div>
              </Link>
            ))}
          </ContentRow>
        )}

        {/* AI Recommendations */}
        {aiRecs.length > 0 && (
          <div className="px-6 md:px-12 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">AI Recommendations</h2>
                <p className="text-xs text-white/40 font-medium">Personalized for you based on your history</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiRecs.map((rec, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex-shrink-0 flex items-center justify-center text-black font-black text-xl">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-primary group-hover:underline">{rec.title}</h3>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{rec.reason}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Anime */}
        <ContentRow title="Trending Anime" icon={<TrendingUp size={24} className="text-primary" />}>
          {trending.map((item) => (
            <ContentCard 
              key={item.id}
              id={item.id}
              title={item.title}
              image={item.image}
              type="anime"
              episode={item.episodeNumber}
              rating={item.rating ? parseFloat(item.rating) / 10 : undefined}
            />
          ))}
        </ContentRow>

        {/* K-Drama Section */}
        <ContentRow 
          title="K-Drama Updates" 
          icon={<Crown size={24} className="text-primary" />}
          onViewAll={() => {}}
        >
          {kdrama.map((item) => (
            <ContentCard 
              key={item.id}
              id={item.id}
              title={item.name}
              image={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              type="kdrama"
              rating={item.vote_average}
              subTitle={`Korean Drama • ${item.first_air_date?.split("-")[0]}`}
            />
          ))}
        </ContentRow>

        {/* Donghua Section */}
        <ContentRow title="Trending Donghua" icon={<Zap size={24} className="text-primary" />}>
          {donghua.map((item) => (
            <ContentCard 
              key={item.id}
              id={item.id}
              title={item.title.english || item.title.romaji}
              image={item.coverImage.extraLarge}
              type="donghua"
              rating={item.averageScore / 10}
            />
          ))}
        </ContentRow>

        {/* Anime Wallpapers (Gallery Preview) */}
        <section className="px-6 sm:px-12 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              Anime Wallpapers <ImageIcon size={24} className="text-primary" />
            </h2>
            <Link to="/gallery" className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
              Explore Gallery <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPreview.map((img, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative group cursor-pointer shadow-2xl"
              >
                <img 
                  src={img.image?.compressed?.url || img.image?.original?.url || null} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt="Wallpaper" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">View in High Quality</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
