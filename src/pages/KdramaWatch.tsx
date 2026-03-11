import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchKdramaDetails, fetchKdramaStream } from "../lib/api";
import { Play, SkipForward, Settings, List, MessageSquare, Send, Crown, AlertCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";
import { VideoPlayer } from "../components/VideoPlayer";

export default function KdramaWatch() {
  const { id, episodeId } = useParams();
  const navigate = useNavigate();
  const [drama, setDrama] = useState<any>(null);
  const [streamData, setStreamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState(0);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsVip(user.isVip || user.role === "OWNER" || false);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (id && episodeId) {
        setLoading(true);
        try {
          const [details, stream] = await Promise.all([
            fetchKdramaDetails(id),
            fetchKdramaStream(episodeId, id)
          ]);
          setDrama(details);
          setStreamData(stream);
        } catch (e) {
          console.error("K-Drama Watch load error:", e);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [id, episodeId]);

  const handleAutoNext = () => {
    const currentIdx = drama?.episodes?.findIndex((e: any) => e.id === episodeId);
    if (currentIdx !== -1 && currentIdx < (drama?.episodes?.length - 1)) {
      const nextEp = drama.episodes[currentIdx + 1];
      navigate(`/kdrama/watch/${id}/${nextEp.id}`);
    }
  };

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

  const currentSource = streamData?.sources?.[server] || streamData?.sources?.[0];
  const currentEp = drama.episodes?.find((e: any) => e.id === episodeId);

  return (
    <div className="pt-24 px-6 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      <LoadingBar isLoading={loading} />
      
      <div className="lg:col-span-3 space-y-6">
        <Link to={`/kdrama/${id}`} className="flex items-center gap-2 text-white/40 hover:text-primary transition-all text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Details
        </Link>

        {/* Video Player Section */}
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group border border-white/10 shadow-2xl">
            {currentSource ? (
              <VideoPlayer 
                src={currentSource.url} 
                poster={drama.image}
                onEnded={handleAutoNext}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-12">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-black tracking-tighter">Stream Unavailable</h2>
                <p className="text-white/60 text-sm max-w-md mt-2">We're having trouble loading this episode. Please try switching servers or check back later.</p>
              </div>
            )}
          </div>

          {/* Server Switcher */}
          {streamData?.sources && streamData.sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 glass-card p-4">
              <span className="text-xs font-black uppercase tracking-widest text-muted ml-2">Available Qualities:</span>
              {streamData.sources.map((s: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setServer(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${server === idx ? "bg-primary text-black border-primary scale-105 shadow-lg shadow-primary/20" : "bg-white/5 border-white/10 text-muted hover:bg-white/10"}`}
                >
                  {s.quality || "Auto"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-2">
              {drama.title} - Episode {currentEp?.number || "?"}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-muted text-sm font-medium uppercase tracking-widest">
                Now Streaming • {currentSource?.quality || "HD"} • Subbed
              </p>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <p className="text-primary text-sm font-bold uppercase tracking-widest">
                {drama.status || "Ongoing"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass-card p-8">
          <p className="text-white/60 text-sm leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer" dangerouslySetInnerHTML={{ __html: drama.description }} />
        </div>
      </div>

      {/* Sidebar: Episodes List */}
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-black tracking-tighter mb-6 flex items-center justify-between">
            Episodes <List size={18} className="text-primary" />
          </h3>
          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {drama.episodes?.map((ep: any) => (
              <Link 
                key={ep.id} 
                to={`/kdrama/watch/${id}/${ep.id}`}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${episodeId === ep.id ? "bg-primary border-primary text-black" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
              >
                <span className={`text-lg font-black italic ${episodeId === ep.id ? "text-black/40" : "text-white/20"}`}>{ep.number.toString().padStart(2, '0')}</span>
                <div className="flex-grow">
                  <p className="font-bold text-sm">Episode {ep.number}</p>
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${episodeId === ep.id ? "text-black/60" : "text-white/30"}`}>HD AVAILABLE</p>
                </div>
                {episodeId === ep.id && <Play size={14} fill="currentColor" />}
              </Link>
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
  );
}
