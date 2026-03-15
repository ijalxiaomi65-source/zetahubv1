import React, { useState } from "react";
import { searchAnimeGogo, searchKdramaTMDB } from "../lib/api";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Star, Film, Tv } from "lucide-react";
import { motion } from "framer-motion";
import { CardSkeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";

type SearchType = "anime" | "kdrama";

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("anime");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      if (searchType === "anime") {
        const data = await searchAnimeGogo(query);
        setResults(data);
      } else {
        const data = await searchKdramaTMDB(query);
        setResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 px-12 max-w-7xl mx-auto pb-20">
      <LoadingBar isLoading={loading} />
      <div className="flex flex-col items-center mb-16">
        <h1 className="text-5xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">Find Your Next Favorite</h1>
        
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setSearchType("anime")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${searchType === "anime" ? "bg-primary text-black" : "bg-white/5 text-white hover:bg-white/10"}`}
          >
            <Tv size={18} />
            Anime & Donghua
          </button>
          <button 
            onClick={() => setSearchType("kdrama")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${searchType === "kdrama" ? "bg-primary text-black" : "bg-white/5 text-white hover:bg-white/10"}`}
          >
            <Film size={18} />
            K-Drama
          </button>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchType === "anime" ? "Search anime, donghua..." : "Search Korean dramas..."}
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
          {results.map((item) => {
            const id = searchType === "anime" ? item.id : item.id;
            const title = searchType === "anime" ? item.title : item.name;
            const image = searchType === "anime" 
              ? item.image 
              : item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;
            const rating = searchType === "anime" ? item.releaseDate : item.vote_average?.toFixed(1);
            const type = searchType === "anime" ? item.subOrDub : "TV Series";

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Link to={searchType === "anime" ? `/anime/${id}` : `/kdrama/${id}`}>
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
                    <img src={image} className="w-full h-full object-cover" alt={title} referrerPolicy="no-referrer" />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold">
                      <Star size={10} className="text-yellow-500 fill-yellow-500" />
                      {rating || "N/A"}
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{type}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {!loading && results.length === 0 && query && (
        <div className="text-center py-20">
          <p className="text-white/40 text-xl">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
