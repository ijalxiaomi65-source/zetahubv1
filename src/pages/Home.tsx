import React, { useEffect, useState } from "react";
import { fetchTrending, fetchPopular } from "../lib/api";
import { Link } from "react-router-dom";
import { Play, Info, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [t, p] = await Promise.all([fetchTrending(), fetchPopular()]);
        setTrending(t);
        setPopular(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

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
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-12 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Trending</span>
              <span className="text-white/60 text-xs font-medium uppercase tracking-widest">{hero?.genres?.slice(0, 2).join(" • ")}</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter mb-4 leading-[0.9]">
              {hero?.title?.english || hero?.title?.romaji}
            </h1>
            <p className="text-white/70 text-lg mb-8 line-clamp-3" dangerouslySetInnerHTML={{ __html: hero?.description }} />
            
            <div className="flex items-center gap-4">
              <Link to={`/watch/${hero?.id}/1`} className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
                <Play size={20} fill="currentColor" /> Watch Now
              </Link>
              <Link to={`/anime/${hero?.id}`} className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10">
                <Info size={20} /> Details
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-12 -mt-20 relative z-10 space-y-16">
        <Section title="Trending Now" items={trending} />
        <Section title="Most Popular" items={popular} />
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
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
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
                <img 
                  src={item.coverImage?.large || item.coverImage?.extraLarge} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={item.title?.english}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  {item.averageScore / 10}
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title?.english || item.title?.romaji}
                </h3>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">
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
