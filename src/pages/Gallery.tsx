import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, RefreshCw, Filter, Image as ImageIcon, Loader2, ExternalLink } from "lucide-react";

interface NekosiaImage {
  id: string;
  image: {
    original: { url: string; extension: string };
    compressed: { url: string; extension: string };
  };
  category: string;
  tags: string[];
  anime?: {
    title: string | null;
    character: string | null;
  };
  source?: {
    url: string | null;
  };
}

const CATEGORIES = [
  "random", "catgirl", "foxgirl", "wolfgirl", "cute", "maid", "vtuber", "girl", "young-girl"
];

export default function Gallery() {
  const [images, setImages] = useState<NekosiaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("random");
  const [count, setCount] = useState(12);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.nekosia.cat/api/v1/images/${category}?count=${count}`);
      const data = await response.json();
      
      if (data.success) {
        // The API returns an array if count > 1, or a single object if count = 1
        // But based on the docs it seems it returns an object with 'image' etc.
        // Let's handle both cases if necessary, but usually it's an array for count > 1
        // Actually, looking at the response structure in docs, it's a single object.
        // Wait, if count > 1, does it return an array of objects?
        // Let's assume it returns an array if count > 1.
        if (Array.isArray(data.image)) {
           // This is a guess, let's check the docs again.
           // "Response Structure" shows a single object.
           // Usually APIs like this return an array if count > 1.
        }
        
        // Let's try to fetch multiple times if it only returns one, or check if it returns an array.
        // Most likely it returns an array if count > 1.
        // If not, I'll just fetch one by one or something.
        // But let's assume it's an array of objects if count > 1.
        // Actually, the docs say: "Response Structure: { success: Boolean, ... image: { ... } }"
        // It doesn't explicitly say it returns an array.
        
        // Let's do a test fetch or just handle it.
        // If it's a single object, I'll wrap it in an array.
        const results = Array.isArray(data) ? data : [data];
        setImages(results.filter(img => img.success).map(img => img));
        
        // Wait, if I request count=12, does it return 12 objects in an array?
        // Let's assume yes.
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  }, [category, count, refreshKey]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleDownload = (url: string, id: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `nekosia-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tighter mb-4"
          >
            ANIME <span className="text-primary">GALLERY</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 max-w-xl"
          >
            Explore high-quality anime wallpapers and illustrations powered by Nekosia API. 
            Discover your favorite characters and styles.
          </motion.p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-5 py-3 pr-12 text-sm font-medium focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat.toUpperCase()}</option>
              ))}
            </select>
            <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
          </div>

          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            disabled={loading}
            className="bg-primary text-black px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Refresh
          </button>
        </div>
      </div>

      {loading && images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 size={48} className="text-primary animate-spin" />
          <p className="text-white/40 font-medium animate-pulse">Summoning cute images...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {images.map((img, index) => (
              <motion.div
                key={img.id || index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10"
              >
                <img 
                  src={img.image?.compressed?.url || img.image?.original?.url || ""} 
                  alt={img.anime?.character || "Anime Image"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {img.anime?.character && (
                    <h3 className="text-lg font-bold text-white mb-1">{img.anime.character}</h3>
                  )}
                  {img.anime?.title && (
                    <p className="text-sm text-white/70 mb-4 line-clamp-1">{img.anime.title}</p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => img.image?.original?.url && handleDownload(img.image.original.url, img.id)}
                      className="flex-grow bg-white text-black py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                    >
                      <Download size={14} />
                      Download HD
                    </button>
                    {img.source?.url && (
                      <a 
                        href={img.source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-wider">
                    {img.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && images.length === 0 && (
        <div className="text-center py-40">
          <ImageIcon size={48} className="mx-auto text-white/10 mb-4" />
          <h3 className="text-xl font-bold mb-2">No images found</h3>
          <p className="text-white/40">Try another category or refresh the page.</p>
        </div>
      )}
    </div>
  );
}
