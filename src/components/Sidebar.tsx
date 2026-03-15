import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Tv, 
  Film, 
  Search, 
  Heart, 
  History, 
  TrendingUp, 
  Image as ImageIcon,
  LayoutGrid,
  Sparkles,
  Shield,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useStore();

  const menuItems = [
    { 
      title: "Discover", 
      items: [
        { name: "Home", icon: Home, path: "/" },
        { name: "Search", icon: Search, path: "/search" },
        { name: "Trending", icon: TrendingUp, path: "/#trending" },
      ]
    },
    { 
      title: "Anime Library", 
      items: [
        { name: "All Anime", icon: Tv, path: "/gallery" },
        { name: "Donghua", icon: Sparkles, path: "/donghua" },
        { name: "Wallpapers", icon: ImageIcon, path: "/gallery" },
      ]
    },
    { 
      title: "K-Drama Library", 
      items: [
        { name: "All K-Dramas", icon: Film, path: "/kdrama" },
        { name: "Popular", icon: LayoutGrid, path: "/kdrama" },
      ]
    },
    { 
      title: "Personal", 
      items: [
        { name: "My Watchlist", icon: Heart, path: "/profile" },
        { name: "History", icon: History, path: "/profile" },
      ]
    },
    ...(user?.role === "OWNER" || user?.role === "ADMIN" ? [{
      title: "Management",
      items: [
        { name: "Admin Panel", icon: Shield, path: "/admin" },
      ]
    }] : [])
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -300, opacity: 0 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#050505] border-r border-white/5 z-[70] flex flex-col pt-24 pb-8 px-6 overflow-y-auto scrollbar-hide lg:translate-x-0 lg:opacity-100 lg:static lg:h-screen lg:pt-28`}
      >
        <div className="space-y-10">
          {menuItems.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-4">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all group ${
                        isActive 
                          ? "bg-primary text-black shadow-lg shadow-primary/20" 
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <item.icon size={18} className={isActive ? "text-black" : "group-hover:text-primary transition-colors"} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Quick Info */}
        {user && (
          <div className="mt-auto pt-8 border-t border-white/5">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden">
                {user.image ? (
                  <img src={user.image} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <span className="text-primary font-black">{user.username?.[0] || 'U'}</span>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate">{user.username}</p>
                  {user.isVip && <Crown size={12} className="text-yellow-500 shrink-0" fill="currentColor" />}
                </div>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                  {user.role === 'OWNER' ? 'OWNER' : user.role === 'ADMIN' ? 'ADMIN' : user.isVip ? 'VIP MEMBER' : 'FREE USER'}
                </p>
              </div>
            </Link>
          </div>
        )}
      </motion.aside>
    </>
  );
}
