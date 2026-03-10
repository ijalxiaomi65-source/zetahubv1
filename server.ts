import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

app.use(express.json());

// --- API ROUTES ---

// Auth
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// User Profile
app.get("/api/user/profile", async (req, res) => {
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
app.post("/api/watchlist", async (req, res) => {
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
app.get("/api/comments/:episodeId", async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { episodeId: req.params.episodeId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(comments);
});

app.post("/api/comments", async (req, res) => {
  const { userId, episodeId, content } = req.body;
  const comment = await prisma.comment.create({
    data: { userId, episodeId, content },
    include: { user: true },
  });
  res.json(comment);
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AniStream Server running on http://localhost:${PORT}`);
  });
}

startServer();
