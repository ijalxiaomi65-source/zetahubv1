import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchDetails, fetchAnimeEpisodes, fetchStreamSources } from "../lib/api";
import { Play, SkipForward, Settings, Maximize, Volume2, List, MessageSquare, Send, Crown, X, CheckCircle2, AlertCircle, ArrowLeft, Star } from "lucide-react";
import { Skeleton } from "../components/Skeleton";
import { LoadingBar } from "../components/LoadingBar";
import { VideoPlayer } from "../components/VideoPlayer";

export default function Watch() {
  const { id, episode } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [streamData, setStreamData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState(0); // Index of source
  const [isVip, setIsVip] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(15);
  const [currentTime, setCurrentTime] = useState(0);

  // Load saved progress
  useEffect(() => {
    if (id && episode) {
      const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");
      const saved = history.find((h: any) => h.animeId === id && h.episode === parseInt(episode));
      if (saved) {
        setCurrentTime(saved.timestamp || 0);
      }
    }
  }, [id, episode]);

  // Heartbeat to save progress
  useEffect(() => {
    if (!loading && anime && id && episode) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 5;
          
          // Save to localStorage
          const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");
          const existingIndex = history.findIndex((h: any) => h.animeId === id);
          
          const entry = {
            animeId: id,
            animeTitle: anime.title.english || anime.title.romaji || anime.title.native,
            animeCover: anime.coverImage.large || anime.coverImage.extraLarge,
            episode: parseInt(episode),
            timestamp: next,
            duration: (anime.duration || 24) * 60,
            updatedAt: Date.now()
          };

          if (existingIndex > -1) {
            history[existingIndex] = entry;
          } else {
            history.unshift(entry);
          }

          localStorage.setItem("watchHistory", JSON.stringify(history.slice(0, 10)));
          return next;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [loading, anime, id, episode]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isOwner = user.name === "Zeta" || user.role === "OWNER";
    setIsVip(user.isVip || isOwner || false);

    if (!user.isVip && !isOwner) {
      const watched = parseInt(localStorage.getItem("videosWatched") || "0");
      if (watched >= 3) {
        setShowAd(true);
        setAdTimer(15);
      }
    }
  }, [id, episode]);

  useEffect(() => {
    let timer: any;
    if (showAd && adTimer > 0) {
      timer = setInterval(() => setAdTimer(prev => prev - 1), 1000);
    } else if (adTimer === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [showAd, adTimer]);

  const handleSkipAd = () => {
    if (adTimer === 0) {
      setShowAd(false);
      localStorage.setItem("videosWatched", "0");
    }
  };

  const handleVideoStart = () => {
    if (!isVip) {
      const currentWatched = parseInt(localStorage.getItem("videosWatched") || "0");
      localStorage.setItem("videosWatched", (currentWatched + 1).toString());
    }
  };

  useEffect(() => {
    const load = async () => {
      if (id && episode) {
        setLoading(true);
        try {
          const [details, eps] = await Promise.all([
            fetchDetails(id),
            fetchAnimeEpisodes(id)
          ]);
          setAnime(details);
          setEpisodes(eps);
          
          const currentEp = eps.find((e: any) => e.number === parseInt(episode));
          if (currentEp) {
            const sources = await fetchStreamSources(currentEp.id);
            setStreamData(sources);
          }

          // Fetch comments
          const res = await fetch(`/api/comments/${id}-${episode}`);
          if (res.ok) {
            const data = await res.json();
            setComments(data);
          }
        } catch (e) {
          console.error("Watch load error:", e);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [id, episode]);

  const handleAutoNext = () => {
    const nextEp = parseInt(episode || "1") + 1;
    if (nextEp <= (anime?.episodes || episodes.length)) {
      navigate(`/watch/${id}/${nextEp}`);
    }
  };

  const buyVip = () => {
    const userStr = localStorage.getItem("user");
    let user = userStr ? JSON.parse(userStr) : { id: "guest-" + Date.now(), name: "Guest" };
    
    user.isVip = true;
    user.role = "VIP";
    localStorage.setItem("user", JSON.stringify(user));
    setIsVip(true);
    setShowVipModal(false);
    alert("VIP Activated! Enjoy ad-free streaming on ZetaHub.");
  };

  const handleRating = (score: number) => {
    alert(`You rated this episode ${score}/5 stars!`);
  };

  if (loading && !anime) {
    return (
      <div className="pt-24 px-6 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <LoadingBar isLoading={loading} />
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="aspect-video rounded-2xl" />
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!anime) return <div className="h-screen flex items-center justify-center">Anime not found</div>;

  const currentSource = streamData?.sources?.[server] || streamData?.sources?.[0];

  return (
    <div className="pt-24 px-6 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      <LoadingBar isLoading={loading} />
      
      {/* Ad Modal */}
      {showAd && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-linear" 
                style={{ width: `${((15 - adTimer) / 15) * 100}%` }}
              />
            </div>
            <div className="space-y-4">
              <span className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/30">ZetaHub Advertisement</span>
              <h2 className="text-4xl font-black tracking-tighter">Support ZetaHub</h2>
              <p className="text-white/60">Watch this short ad to unlock 3 more episodes for free. Or upgrade to VIP to skip all ads forever.</p>
            </div>
            
            <div className="aspect-video bg-black rounded-2xl border border-white/10 flex items-center justify-center relative group">
              <Play size={48} className="text-primary opacity-50 group-hover:opacity-100 transition-all" />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold border border-white/10">
                {adTimer > 0 ? `Skip in ${adTimer}s` : "Ready to skip"}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleSkipAd}
                disabled={adTimer > 0}
                className={`px-8 py-4 rounded-2xl font-bold transition-all ${adTimer === 0 ? "bg-white text-black hover:scale-105" : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"}`}
              >
                Skip Ad
              </button>
              <button 
                onClick={() => { setShowAd(false); setShowVipModal(true); }}
                className="bg-primary text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Go VIP (No Ads)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Modal */}
      {showVipModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-3xl p-8 relative shadow-2xl">
            <button onClick={() => setShowVipModal(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-all">
              <X size={24} />
            </button>
            
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/40">
                <Crown size={40} className="text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter">ZETAHUB VIP</h2>
                <p className="text-white/60 text-sm">The ultimate anime experience</p>
              </div>

              <div className="space-y-4 text-left bg-white/5 p-6 rounded-2xl border border-white/5">
                {[
                  "No Ads Forever",
                  "Watch in 4K Ultra HD",
                  "Early Access to New Episodes",
                  "Download for Offline Viewing",
                  "Exclusive VIP Badge"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-white/40 text-sm">Monthly Plan</span>
                  <span className="text-2xl font-black text-primary">Rp 29.000</span>
                </div>
                <button 
                  onClick={buyVip}
                  className="w-full bg-primary text-black py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                >
                  ACTIVATE VIP NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:col-span-3 space-y-6">
        {/* Video Player Section */}
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group border border-white/10 shadow-2xl">
            {currentSource ? (
              <VideoPlayer 
                src={currentSource.url} 
                poster={anime.bannerImage || anime.coverImage.extraLarge}
                onEnded={handleAutoNext}
                onPlay={handleVideoStart}
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
              <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">All Servers Online</span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-2">
              {anime.title.english || anime.title.romaji || anime.title.native} - Episode {episode}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-muted text-sm font-medium uppercase tracking-widest">
                Now Streaming • {currentSource?.quality || "HD"} • Subbed
              </p>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <p className="text-primary text-sm font-bold uppercase tracking-widest">
                {anime.status}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1 bg-white/5 p-2 rounded-xl border border-white/10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => handleRating(star)}
                  className="text-white/20 hover:text-yellow-500 transition-all"
                >
                  <Star size={18} />
                </button>
              ))}
            </div>
            <button className="glass-card p-3 hover:bg-white/10 transition-all">
              <MessageSquare size={20} />
            </button>
            <button className="glass-card p-3 hover:bg-white/10 transition-all">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="glass-card p-8">
          <p className="text-white/60 text-sm leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer" dangerouslySetInnerHTML={{ __html: anime.description }} />
        </div>

        {/* Comments Section */}
        <div className="pt-12 space-y-8">
          <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
            Comments <span className="text-sm font-normal text-white/40 bg-white/5 px-2 py-0.5 rounded">{comments.length}</span>
          </h3>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            // Handle comment submit
          }} className="relative">
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
            {comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                  <span className="text-primary font-bold">{comment.user?.name?.[0] || "?"}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{comment.user?.name || "Anonymous"}</span>
                    <span className="text-white/20 text-xs">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/70 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
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
            {episodes.length > 0 ? (
              episodes.map((ep: any) => (
                <Link 
                  key={ep.id} 
                  to={`/watch/${id}/${ep.number}`}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${parseInt(episode || "1") === ep.number ? "bg-primary border-primary text-black" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                >
                  <span className={`text-lg font-black italic ${parseInt(episode || "1") === ep.number ? "text-black/40" : "text-white/20"}`}>{ep.number.toString().padStart(2, '0')}</span>
                  <div className="flex-grow">
                    <p className="font-bold text-sm line-clamp-1">{ep.title || `Episode ${ep.number}`}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-widest ${parseInt(episode || "1") === ep.number ? "text-black/60" : "text-white/30"}`}>24:00</p>
                  </div>
                  {parseInt(episode || "1") === ep.number && <Play size={14} fill="currentColor" />}
                </Link>
              ))
            ) : (
              Array.from({ length: anime.episodes || 12 }).map((_, i) => (
                <Link 
                  key={i} 
                  to={`/watch/${id}/${i + 1}`}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${parseInt(episode || "1") === i + 1 ? "bg-primary border-primary text-black" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                >
                  <span className={`text-lg font-black italic ${parseInt(episode || "1") === i + 1 ? "text-black/40" : "text-white/20"}`}>{(i + 1).toString().padStart(2, '0')}</span>
                  <div className="flex-grow">
                    <p className="font-bold text-sm">Episode {i + 1}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-widest ${parseInt(episode || "1") === i + 1 ? "text-black/60" : "text-white/30"}`}>24:00</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* VIP Card */}
        {!isVip && (
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
            <Crown size={32} className="mx-auto text-primary" />
            <h4 className="font-bold">Upgrade to VIP</h4>
            <p className="text-xs text-white/60">Remove all ads, watch in 4K, and get early access to new episodes!</p>
            <button 
              onClick={() => setShowVipModal(true)}
              className="w-full bg-primary text-black py-3 rounded-xl font-bold text-sm hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
            >
              Go Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
