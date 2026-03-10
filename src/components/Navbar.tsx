import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Crown, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[#050505]/90 backdrop-blur-md py-3 shadow-xl" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span className="text-primary">ANI</span>STREAM
            <span className="bg-primary text-black text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest">PRO</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/trending" className="hover:text-white transition-colors">Trending</Link>
            <Link to="/donghua" className="hover:text-white transition-colors">Donghua</Link>
            <Link to="/movies" className="hover:text-white transition-colors">Movies</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/search" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Search size={20} />
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:border-primary transition-all">
                  <User size={16} className="text-primary" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                {user.role === "VIP" && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
              </Link>
              <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-all">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
