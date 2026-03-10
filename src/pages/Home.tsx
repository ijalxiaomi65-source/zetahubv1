import React, { useEffect, useState } from "react";
import { fetchTrending, fetchPopular, fetchTrendingDonghua, fetchPopularDonghua } from "../lib/api";
import { Link } from "react-router-dom";
import { Play, Info, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [trendingDonghua, setTrendingDonghua] = useState<any[]>([]);
  const [popularDonghua, setPopularDonghua] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Stagger requests to avoid rate limit
        const t = await fetchTrending();
        await new Promise(r => setTimeout(r, 500));
        const p = await fetchPopular();
        await new Promise(r => setTimeout(r, 500));
        const td = await fetchTrendingDonghua();
        await new Promise(r => setTimeout(r, 500));
        const pd = await fetchPopularDonghua();
        
        setTrending(t);
        setPopular(p);
        setTrendingDonghua(td);
        setPopularDonghua(pd);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
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

  const hero = trending[0];

  return (
    <div className="pb-20">
      {/* Hero Banner */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <img 
          src={hero?.bannerImage || hero?.coverImage?.extraLarge} 
          className="w-full h-full object-cover"
          alt={hero?.title?.english}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-12 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Trending</span>
              <span className="text-muted text-xs font-medium uppercase tracking-widest">{hero?.genres?.slice(0, 2).join(" • ")}</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter mb-4 leading-[0.9]">
              {hero?.title?.english || hero?.title?.romaji || hero?.title?.native}
            </h1>
            <p className="text-muted text-lg mb-8 line-clamp-3" dangerouslySetInnerHTML={{ __html: hero?.description }} />
            
            <div className="flex items-center gap-4">
              <Link to={`/watch/${hero?.id}/1`} className="bg-primary text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all">
                <Play size={20} fill="currentColor" /> Watch Now
              </Link>
              <Link to={`/anime/${hero?.id}`} className="glass-card px-8 py-4 font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                <Info size={20} /> Details
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-12 -mt-20 relative z-10 space-y-20">
        <Section title="Trending Donghua" items={trendingDonghua} />
        <Section title="Popular Donghua" items={popularDonghua} />
        <Section title="Trending Anime" items={trending} />
        <Section title="Most Popular Anime" items={popular} />
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
          {title} <ChevronRight size={20} className="text-primary" />
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05 }}
            className="group relative"
          >
            <Link to={`/anime/${item.id}`}>
              <div className="aspect-[2/3] glass-card overflow-hidden relative">
                <img 
                  src={item.coverImage?.large || item.coverImage?.extraLarge} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={item.title?.english}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold text-white">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  {item.averageScore / 10}
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title?.english || item.title?.romaji || item.title?.native}
                </h3>
                <p className="text-muted text-[10px] uppercase tracking-widest mt-1">
                  {item.status || "Ongoing"}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
