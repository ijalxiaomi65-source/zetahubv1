import React, { useState, useEffect } from "react";
import { searchAnime } from "../lib/api";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Filter, Star } from "lucide-react";
import { motion } from "framer-motion";
import { CardSkeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchAnime(query);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 px-12 max-w-7xl mx-auto">
      <LoadingBar isLoading={loading} />
      <div className="flex flex-col items-center mb-16">
        <h1 className="text-5xl font-black tracking-tighter mb-8">Find Your Next Favorite</h1>
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime, donghua, movies..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-xl focus:outline-none focus:border-primary transition-all shadow-2xl"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-black px-6 py-3 rounded-xl font-bold hover:bg-primary/80 transition-all">
            Search
          </button>
        </form>
      </div>

      {loading && results.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map((item) => (
            <motion.div
              key={item.mal_id}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Link to={`/anime/${item.mal_id}`}>
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
                  <img src={item.images?.jpg?.large_image_url || null} className="w-full h-full object-cover" alt={item.title} />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    {item.score || "N/A"}
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{item.type} • {item.status}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
