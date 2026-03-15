import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { createRequire } from "module";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

let prisma: any;
try {
  const require = createRequire(import.meta.url);
  const { PrismaClient } = require("@prisma/client");
  prisma = new PrismaClient();
} catch (e) {
  console.warn("Prisma Client could not be initialized. Using mock mode.");
  prisma = {
    user: {
      create: async () => { throw new Error("DB_MISSING") },
      findUnique: async () => { throw new Error("DB_MISSING") },
      update: async () => { throw new Error("DB_MISSING") }
    },
    subscription: {
      create: async () => { throw new Error("DB_MISSING") },
      update: async () => { throw new Error("DB_MISSING") },
      findUnique: async () => { throw new Error("DB_MISSING") }
    },
    watchlist: {
      create: async () => { throw new Error("DB_MISSING") },
      findMany: async () => [],
      delete: async () => { throw new Error("DB_MISSING") }
    },
    history: {
      create: async () => { throw new Error("DB_MISSING") },
      upsert: async () => { throw new Error("DB_MISSING") },
      findMany: async () => []
    },
    comment: {
      findMany: async () => [],
      create: async () => { throw new Error("DB_MISSING") }
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

// Proxy for TMDB (K-Drama)
const tmdbCache = new Map<string, { data: any; timestamp: number }>();
const TMDB_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

app.get("/api/proxy/tmdb/*", async (req, res) => {
  try {
    const subPath = req.params[0];
    const query = new URLSearchParams(req.query as any).toString();
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "TMDB_API_KEY is not configured" });
    }

    const cacheKey = `${subPath}?${query}`;
    const cached = tmdbCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TMDB_CACHE_TTL) {
      return res.json(cached.data);
    }

    const url = `https://api.themoviedb.org/3/${subPath}?api_key=${apiKey}${query ? "&" + query : ""}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      tmdbCache.set(cacheKey, { data, timestamp: Date.now() });
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error("TMDB Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch from TMDB" });
  }
});

// Proxy for Consumet (Anime & Donghua)
app.get("/api/proxy/consumet/*", async (req, res) => {
  try {
    const subPath = req.params[0];
    const query = new URLSearchParams(req.query as any).toString();
    
    // Try multiple instances if one fails
    const instances = [
      "https://api.consumet.org",
      "https://consumet-api-production-e65a.up.railway.app",
      "https://consumet-api-clone.vercel.app",
      "https://consumet-api-one.vercel.app",
      "https://consumet-api-two.vercel.app",
      "https://consumet-api-three.vercel.app",
      "https://consumet-api-four.vercel.app",
      "https://consumet-api-five.vercel.app",
      "https://consumet-api-six.vercel.app",
      "https://consumet-api-seven.vercel.app",
      "https://consumet-api-eight.vercel.app",
      "https://consumet-api-nine.vercel.app",
      "https://consumet-api-ten.vercel.app",
      "https://api-consumet-org.vercel.app",
      "https://consumet-org.vercel.app",
      "https://consumet-api.vercel.app"
    ];
    
    let lastError = null;
    for (let i = 0; i < instances.length; i++) {
      const base = instances[i];
      try {
        const url = `${base}/${subPath}${query ? "?" + query : ""}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
          },
          signal: controller.signal
        });
        clearTimeout(timeout);

        // If it's a 404, it might be that this specific instance doesn't have the data, 
        // but the instance itself is alive. We should still try others.
        if (response.status === 404) {
          continue;
        }

        if (!response.ok) {
          throw new Error(`Instance ${base} returned ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        
        if (contentType.includes("application/json")) {
          const data = await response.json();
          // Some instances return an error object in JSON
          if (data.error || data.message === "An error occurred") {
            throw new Error(`Instance ${base} returned API error: ${data.error || data.message}`);
          }
          return res.status(response.status).json(data);
        } else {
          // If we expected JSON but got something else
          if (subPath.includes("info") || subPath.includes("watch") || subPath.includes("trending") || subPath.includes("popular") || subPath.includes("search")) {
             throw new Error(`Instance ${base} returned non-JSON content (${contentType})`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          res.setHeader("Content-Type", contentType);
          res.setHeader("Cache-Control", "public, max-age=3600");
          return res.status(response.status).send(buffer);
        }
      } catch (err) {
        console.warn(`Consumet instance ${base} failed (attempt ${i+1}/${instances.length}):`, err instanceof Error ? err.message : err);
        lastError = err;
        // No delay needed, just move to next
        continue; 
      }
    }
    
    throw lastError || new Error("All Consumet instances failed");
  } catch (error) {
    console.error("Consumet Proxy Final Error:", error);
    res.status(500).json({ error: "Failed to fetch from Consumet", details: error instanceof Error ? error.message : "Unknown error" });
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
  const { email, password, username, secret } = req.body;
  try {
    let role = "USER";
    if (secret && secret === process.env.OWNER_SECRET) {
      role = "OWNER";
    }
    
    // Special check for Zeta
    if (username === "Zeta" || email === "zeta@zeta.com") {
      role = "OWNER";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        username,
        passwordHash: hashedPassword, 
        role,
        isVerified: role === "OWNER"
      },
    });
    
    // Create default subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: role === "OWNER" ? "PREMIUM" : "FREE",
        status: "ACTIVE"
      }
    });
    
    res.json({ success: true, user: { id: user.id, email: user.email, username: user.username, role: user.role, isVip: role === "OWNER" } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ 
      where: email.includes("@") ? { email } : { username: email },
      include: { subscription: true }
    });

    if (user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
      const isVip = user.role === "VIP" || user.role === "OWNER" || user.subscription?.plan === "PREMIUM";
      return res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role, isVip } });
    }
    
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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

router.patch("/user/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { name, image } = req.body;
    
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { 
        ...(name && { name }),
        ...(image && { image })
      },
    });
    
    // Update mock storage if user is there
    const mockIdx = mockUsers.findIndex(u => u.id === decoded.userId);
    if (mockIdx !== -1) {
      if (name) mockUsers[mockIdx].name = name;
      if (image) mockUsers[mockIdx].image = image;
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({ error: "Failed to update profile" });
  }
});

// Stripe Checkout
router.post("/stripe/create-checkout-session", async (req, res) => {
  const { userId, plan } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
    if (!user) return res.status(404).json({ error: "User not found" });

    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      await prisma.subscription.update({
        where: { userId: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ZetaHub ${plan} Subscription`,
              description: "Premium access to all anime and donghua content.",
            },
            unit_amount: plan === "PREMIUM" ? 999 : 1999, // $9.99 or $19.99
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.APP_URL}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      metadata: { userId: user.id, plan }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Stripe Webhook
router.post("/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    await prisma.subscription.update({
      where: { userId },
      data: {
        plan: plan,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    
    await prisma.user.update({
      where: { id: userId },
      data: { role: "VIP" }
    });
  }

  res.json({ received: true });
});

// Watch History
router.post("/history", async (req, res) => {
  const { userId, animeId, episodeId, episodeNum, progress, duration } = req.body;
  try {
    const history = await prisma.history.upsert({
      where: { userId_animeId: { userId, animeId } },
      update: { episodeId, episodeNum, progress, duration, lastWatched: new Date() },
      create: { userId, animeId, episodeId, episodeNum, progress, duration }
    });
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: "Failed to save history" });
  }
});

router.get("/history/:userId", async (req, res) => {
  try {
    const history = await prisma.history.findMany({
      where: { userId: req.params.userId },
      orderBy: { lastWatched: "desc" },
      take: 20
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Favorites (Watchlist)
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

router.get("/watchlist/:userId", async (req, res) => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" }
    });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

router.delete("/watchlist/:userId/:animeId", async (req, res) => {
  try {
    await prisma.watchlist.delete({
      where: { userId_animeId: { userId: req.params.userId, animeId: req.params.animeId } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Failed to remove from watchlist" });
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
  const isProd = process.env.NODE_ENV === "production";
  
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`ZetaHub Dev Server running on http://localhost:${PORT}`);
    });
  }
}

// Only start the server in development
if (process.env.NODE_ENV !== "production") {
  startServer().catch(err => {
    console.error("Failed to start server:", err);
  });
}

export default app;
