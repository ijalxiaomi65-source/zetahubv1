console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("Keys in env:", Object.keys(process.env).filter(k => !k.startsWith("npm_")));
