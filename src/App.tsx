import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Details from "./pages/Details";
import Watch from "./pages/Watch";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Search from "./pages/Search";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/anime/:id" element={<Details />} />
            <Route path="/watch/:id/:episode" element={<Watch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>
        <footer className="p-8 text-center text-white/40 text-sm border-t border-white/5">
          &copy; 2026 AniStream Premium. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}
