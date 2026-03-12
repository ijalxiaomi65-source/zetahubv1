import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Crown, LogOut, Sun, Moon, Menu } from "lucide-react";
import { useStore } from "../store/useStore";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, theme, setTheme, logout } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    document.documentElement.setAttribute("data-theme", theme);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 ${isScrolled ? "bg-[var(--bg)]/90 backdrop-blur-md py-3 shadow-xl" : "bg-transparent py-6"}`}>
      <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-10">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-full transition-colors lg:hidden"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span className="text-primary">ZETA</span>HUB
            <span className="bg-primary text-black text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest">PRO</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium opacity-70">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
            <Link to="/kdrama" className="hover:text-primary transition-colors font-bold text-primary">K-Drama</Link>
            <Link to="/search" className="hover:text-primary transition-colors">Search</Link>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link to="/search" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Search size={20} />
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:border-primary transition-all overflow-hidden">
                  {user.image ? (
                    <img src={user.image} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <User size={16} className="text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                {user.role === "VIP" && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
              </Link>
              <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-primary text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
