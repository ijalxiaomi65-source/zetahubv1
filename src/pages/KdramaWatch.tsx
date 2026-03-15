import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchKdramaDetailsTMDB } from "../lib/api";
import { Play, List, Crown, ArrowLeft, Star, Calendar } from "lucide-react";
import { Skeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";

export default function KdramaWatch() {
  const { id, episodeId } = useParams();
  const [drama, setDrama] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsVip(user.isVip || user.role === "OWNER" || false);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (id) {
        setLoading(true);
        try {
          const details = await fetchKdramaDetailsTMDB(id);
          setDrama(details);
        } catch (e) {
          console.error("K-Drama Watch load error:", e);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [id]);

  if (loading && !drama) {
    return (
      <div className="pt-24 px-6 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <LoadingBar isLoading={loading} />
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="aspect-video rounded-2xl" />
          <Skeleton className="h-12 w-1/2" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!drama) return <div className="h-screen flex items-center justify-center">K-Drama not found</div>;

  // episodeId format: "season-episode" e.g. "1-1"
  const [seasonNum, episodeNum] = (episodeId || "1-1").split("-");
  
  // Embed URL using vidsrc.to (common for TMDB)
  const embedUrl = `https://vidsrc.to/embed/tv/${id}/${seasonNum}/${episodeNum}`;

  return (
    <div className="relative min-h-screen pb-20">
      <LoadingBar isLoading={loading} />
      
      {/* Background Wallpaper */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <img 
          src={drama.backdrop_path ? `https://image.tmdb.org/t/p/original${drama.backdrop_path}` : null} 
          className="w-full h-full object-cover blur-3xl" 
          alt="" 
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10 pt-24 px-6 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      <div className="lg:col-span-3 space-y-6">
        <Link to={`/kdrama/${id}`} className="flex items-center gap-2 text-white/40 hover:text-primary transition-all text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Details
        </Link>

        {/* Video Player Section */}
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group border border-white/10 shadow-2xl">
            <iframe 
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              title={`${drama.name} - S${seasonNum} E${episodeNum}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 glass-card p-4">
            <span className="text-xs font-black uppercase tracking-widest text-muted ml-2">Streaming from:</span>
            <div className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-black border border-primary">
              VidSrc Premium
            </div>
            <p className="text-[10px] text-white/40 ml-auto">If player is slow, try refreshing or checking your connection.</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-2">
              {drama.name} - Season {seasonNum} Episode {episodeNum}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-yellow-500 font-black text-sm">
                <Star size={16} fill="currentColor" />
                {drama.vote_average?.toFixed(1)}
              </div>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <p className="text-muted text-sm font-medium uppercase tracking-widest">
                Now Streaming • HD • Multi-Sub
              </p>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <p className="text-primary text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> {drama.first_air_date?.split("-")[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass-card p-8">
          <p className="text-white/60 text-sm leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
            {drama.overview}
          </p>
        </div>
      </div>

      {/* Sidebar: Episodes List */}
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-black tracking-tighter mb-6 flex items-center justify-between">
            Seasons & Episodes <List size={18} className="text-primary" />
          </h3>
          <div className="space-y-8 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {drama.seasons?.filter((s: any) => s.season_number > 0).map((season: any) => (
              <div key={season.id} className="space-y-3">
                <h4 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-4">{season.name}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {Array.from({ length: season.episode_count }).map((_, i) => {
                    const epId = `${season.season_number}-${i + 1}`;
                    const isActive = episodeId === epId;
                    return (
                      <Link 
                        key={i} 
                        to={`/kdrama/watch/${id}/${epId}`}
                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isActive ? "bg-primary border-primary text-black" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                      >
                        <span className={`text-lg font-black italic ${isActive ? "text-black/40" : "text-white/20"}`}>{(i + 1).toString().padStart(2, '0')}</span>
                        <div className="flex-grow">
                          <p className="font-bold text-sm">Episode {i + 1}</p>
                          <p className={`text-[10px] uppercase font-bold tracking-widest ${isActive ? "text-black/60" : "text-white/30"}`}>HD AVAILABLE</p>
                        </div>
                        {isActive && <Play size={14} fill="currentColor" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Card */}
        {!isVip && (
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden group">
            <Crown size={32} className="mx-auto text-primary" />
            <h4 className="font-bold">Upgrade to VIP</h4>
            <p className="text-xs text-white/60">Remove all ads and watch in 4K!</p>
            <button className="w-full bg-primary text-black py-3 rounded-xl font-bold text-sm hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">
              Go Premium
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
