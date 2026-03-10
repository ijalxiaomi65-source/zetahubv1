import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

dotenv.config();

let prisma: any;
try {
  const { PrismaClient } = require("@prisma/client");
  prisma = new PrismaClient();
} catch (e) {
  console.warn("Prisma Client could not be initialized. Using mock mode.");
  prisma = {
    user: {
      create: async () => { throw new Error("DB_MISSING") },
      findUnique: async () => { throw new Error("DB_MISSING") }
    }
  };
}

const app = express();
const PORT = parseInt(process.env.PORT || "3000");
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

app.use(cors());
app.use(express.json());

// Proxy for AniList
const anilistCache = new Map<string, { data: any; timestamp: number }>();
const ANILIST_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

app.post("/api/proxy/anilist", async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.body);
    const cached = anilistCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ANILIST_CACHE_TTL) {
      return res.json(cached.data);
    }

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      anilistCache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error("AniList Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch from AniList" });
  }
});

// Proxy for Jikan
app.get("/api/proxy/jikan/*", async (req, res) => {
  try {
    const path = req.params[0];
    const query = new URLSearchParams(req.query as any).toString();
    const url = `https://api.jikan.moe/v4/${path}${query ? "?" + query : ""}`;
    
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Jikan Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch from Jikan" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// --- API ROUTES ---
const router = express.Router();

// Mock database for fallback
let mockUsers: any[] = [
  {
    id: "owner-1",
    email: "zeta@zeta.com",
    name: "Zeta",
    password: "zeta@11", // In real app use bcrypt, but for this specific request we'll handle it
    role: "OWNER",
    isVip: true
  }
];

// Auth
router.post("/auth/register", async (req, res) => {
  const { email, password, name, secret } = req.body;
  try {
    let role = "USER";
    if (secret && secret === process.env.OWNER_SECRET) {
      role = "OWNER";
    }
    
    // Special check for Zeta
    if (name === "Zeta" || email === "Zeta" || email === "zeta@zeta.com") {
      role = "OWNER";
    }

    let user;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: { email, password: hashedPassword, name, role },
      });
    } catch (dbError) {
      console.warn("Prisma failed, using mock storage:", dbError);
      user = { id: `mock-${Date.now()}`, email, name, role, isVip: role === "OWNER" || role === "VIP" };
      mockUsers.push({ ...user, password }); 
    }
    
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role, isVip: user.isVip } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Special check for owner account Zeta
  if ((email === "Zeta" || email === "zeta@zeta.com") && password === "zeta@11") {
    return res.json({ 
      token: jwt.sign({ userId: "owner-1", role: "OWNER" }, JWT_SECRET),
      user: { id: "owner-1", email: "zeta@zeta.com", name: "Zeta", role: "OWNER", isVip: true }
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, isVip: user.role === "VIP" || user.role === "OWNER" } });
    }
  } catch (dbError) {
    console.warn("Prisma login failed, checking mock storage");
  }

  // Check mock storage as fallback
  const mockUser = mockUsers.find(u => (u.email === email || u.name === email) && u.password === password);
  if (mockUser) {
    const token = jwt.sign({ userId: mockUser.id, role: mockUser.role }, JWT_SECRET);
    return res.json({ token, user: { id: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role, isVip: mockUser.isVip || mockUser.role === "OWNER" } });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

// User Profile
router.get("/user/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { subscription: true, watchlist: true },
    });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Watchlist
router.post("/watchlist", async (req, res) => {
  const { userId, animeId, title, image, type } = req.body;
  try {
    const item = await prisma.watchlist.create({
      data: { userId, animeId, title, image, type },
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: "Already in watchlist" });
  }
});

// Comments
router.get("/comments/:episodeId", async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { episodeId: req.params.episodeId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(comments);
  } catch (e) {
    res.json([]); // Return empty array if DB fails
  }
});

router.post("/comments", async (req, res) => {
  const { userId, episodeId, content } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: { userId, episodeId, content },
      include: { user: true },
    });
    res.json(comment);
  } catch (e) {
    // Mock comment for demo if DB fails
    res.json({
      id: `mock-comment-${Date.now()}`,
      content,
      createdAt: new Date(),
      user: { name: "You (Demo Mode)" }
    });
  }
});

app.use("/api", router);

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ZetaHub Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;
