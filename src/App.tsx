import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Details from "./pages/Details";
import Gallery from "./pages/Gallery";
import Watch from "./pages/Watch";
import Kdrama from "./pages/Kdrama";
import KdramaDetails from "./pages/KdramaDetails";
import KdramaWatch from "./pages/KdramaWatch";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Admin from "./pages/Admin";
import HumanVerification from "./components/HumanVerification";
import Sidebar from "./components/Sidebar";
import PreparingScreen from "./components/PreparingScreen";
import { useStore } from "./store/useStore";

export default function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isPreparing } = useStore();

  useEffect(() => {
    const verified = sessionStorage.getItem("human_verified");
    if (verified === "true") {
      setIsVerified(true);
    }
    setChecking(false);
  }, []);

  const handleVerify = () => {
    sessionStorage.setItem("human_verified", "true");
    setIsVerified(true);
  };

  if (checking) return null;

  if (!isVerified) {
    return <HumanVerification onVerify={handleVerify} />;
  }

  if (isPreparing) {
    return <PreparingScreen />;
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <div className="min-h-screen flex flex-col">
          <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="flex flex-1 pt-0">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="flex-grow min-w-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/anime/:id" element={<Details />} />
                <Route path="/watch/:id/:episode" element={<Watch />} />
                <Route path="/kdrama" element={<Kdrama />} />
                <Route path="/kdrama/:id" element={<KdramaDetails />} />
                <Route path="/kdrama/watch/:id/:episodeId" element={<KdramaWatch />} />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/search" element={<Search />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
          <footer className="p-8 text-center text-white/40 text-sm border-t border-white/5 lg:ml-72">
            &copy; 2026 ZetaHub Premium. All rights reserved.
          </footer>
        </div>
      )}
    </Router>
  );
}
