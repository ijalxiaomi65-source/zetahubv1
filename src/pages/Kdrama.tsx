import React, { useEffect, useState } from "react";
import { fetchTrendingKdrama, fetchPopularKdrama } from "../lib/api";
import { Link } from "react-router-dom";
import { Play, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { SectionSkeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";

export default function Kdrama() {
  const [trending, setTrending] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [t, p] = await Promise.all([
          fetchTrendingKdrama(),
          fetchPopularKdrama()
        ]);
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

  return (
    <div className="pt-32 pb-20 px-6 sm:px-12 max-w-[1800px] mx-auto space-y-20">
      <LoadingBar isLoading={loading} />
      
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">Korean Dramas</h1>
        <p className="text-white/40 max-w-2xl">The latest and most popular K-Dramas, updated daily. High quality streaming with multiple server options.</p>
      </div>

      {loading ? (
        <div className="space-y-20">
          <SectionSkeleton title="Trending K-Drama" />
          <SectionSkeleton title="Popular K-Drama" />
        </div>
      ) : (
        <>
          {/* Trending Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                Trending Now <span className="text-xs font-normal text-white/40 bg-white/5 px-2 py-0.5 rounded">HOT</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {trending.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Link to={`/kdrama/${item.id}`}>
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl">
                      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div className="w-full h-12 bg-primary text-black rounded-xl flex items-center justify-center font-bold gap-2">
                          <Play size={16} fill="currentColor" /> Watch Now
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1">
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">K-Drama • {item.releaseDate || "2026"}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Popular Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter">Popular Series</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {popular.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Link to={`/kdrama/${item.id}`}>
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl">
                      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                    </div>
                    <div className="mt-4 space-y-1">
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">K-Drama • Popular</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
