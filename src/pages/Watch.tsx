import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchDetails } from "../lib/api";
import { Play, SkipForward, Settings, Maximize, Volume2, List, MessageSquare, Send, Crown } from "lucide-react";

export default function Watch() {
  const { id, episode } = useParams();
  const [anime, setAnime] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const data = await fetchDetails(id);
        setAnime(data);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return alert("Please login to comment");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, episodeId: `${id}-${episode}`, content: newComment }),
    });
    
    if (res.ok) {
      const comment = await res.json();
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Player...</div>;

  return (
    <div className="pt-24 px-6 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        {/* Video Player Mockup */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group border border-white/10 shadow-2xl">
          <img 
            src={anime.bannerImage || anime.coverImage.extraLarge} 
            className="w-full h-full object-cover opacity-40 blur-sm"
            alt="Player Background"
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary animate-pulse">
              <Play size={48} className="text-primary ml-2" fill="currentColor" />
            </div>
          </div>

          {/* Player Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-primary" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Play size={24} fill="currentColor" />
                <SkipForward size={24} />
                <Volume2 size={24} />
                <span className="text-sm font-medium">12:34 / 24:00</span>
              </div>
              
              <div className="flex items-center gap-6 text-white/60">
                <button className="bg-primary/20 text-primary px-3 py-1 rounded text-xs font-bold border border-primary/30">Skip Intro</button>
                <Settings size={20} />
                <List size={20} />
                <Maximize size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-2">
              {anime.title.english || anime.title.romaji} - Episode {episode}
            </h1>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
              Now Streaming • 1080p • Subbed
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="pt-12 space-y-8">
          <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
            Comments <span className="text-sm font-normal text-white/40 bg-white/5 px-2 py-0.5 rounded">124</span>
          </h3>
          
          <form onSubmit={handleComment} className="relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Join the discussion..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[120px] focus:outline-none focus:border-primary transition-all resize-none"
            />
            <button type="submit" className="absolute bottom-4 right-4 bg-primary text-black p-3 rounded-xl hover:bg-primary/80 transition-all">
              <Send size={20} />
            </button>
          </form>

          <div className="space-y-6">
            {/* Mock Comment */}
            <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <span className="text-primary font-bold">JD</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">John Doe</span>
                  <span className="bg-primary text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">VIP</span>
                  <span className="text-white/20 text-xs">2 hours ago</span>
                </div>
                <p className="text-white/70 leading-relaxed">This episode was absolutely insane! The animation quality in the final fight scene is peak. Can't wait for next week!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Episodes List */}
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-black tracking-tighter mb-6 flex items-center justify-between">
            Episodes <List size={18} className="text-primary" />
          </h3>
          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {Array.from({ length: anime.episodes || 12 }).map((_, i) => (
              <Link 
                key={i} 
                to={`/watch/${anime.id}/${i + 1}`}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${parseInt(episode || "1") === i + 1 ? "bg-primary border-primary text-black" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
              >
                <span className={`text-lg font-black italic ${parseInt(episode || "1") === i + 1 ? "text-black/40" : "text-white/20"}`}>{(i + 1).toString().padStart(2, '0')}</span>
                <div className="flex-grow">
                  <p className="font-bold text-sm">Episode {i + 1}</p>
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${parseInt(episode || "1") === i + 1 ? "text-black/60" : "text-white/30"}`}>24:00</p>
                </div>
                {parseInt(episode || "1") === i + 1 && <Play size={14} fill="currentColor" />}
              </Link>
            ))}
          </div>
        </div>

        {/* Ads Mockup for Free Users */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center space-y-4">
          <Crown size={32} className="mx-auto text-primary" />
          <h4 className="font-bold">Upgrade to VIP</h4>
          <p className="text-xs text-white/60">Remove all ads, watch in 4K, and get early access to new episodes!</p>
          <button className="w-full bg-primary text-black py-3 rounded-xl font-bold text-sm hover:bg-primary/80 transition-all">Go Premium</button>
        </div>
      </div>
    </div>
  );
}
