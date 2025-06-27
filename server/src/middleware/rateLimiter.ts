import {rateLimit, MemoryStore} from "express-rate-limit";

const globalTestStore = new MemoryStore();
const loginTestStore = new MemoryStore();
const registerTestStore = new MemoryStore();
const refreshTestStore = new MemoryStore();

export const globalLimiter = rateLimit({ // TODO: change max attempts higher later. 3 is temporary for multiple sensitive endpoints.
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 3 requests per IP 
  standardHeaders: true, // Uses new and modern headers
  legacyHeaders: false, // Disables old ones
  store: globalTestStore,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many attempts. Please try again later."
    });
  }
});

export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: loginTestStore,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many login attempts. Please try again later."
    });
  }
});

export const registerRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: registerTestStore,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many registration attempts. Please try again later."
    });
  }
});

export const refreshRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: refreshTestStore,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many refresh attempts. Please try again later."
    });
  }
});


export const resetRateLimiters = () => {
  const testIp = "::ffff:127.0.0.1"
  globalTestStore.resetKey(testIp);
  loginTestStore.resetKey(testIp);
  registerTestStore.resetKey(testIp);
  refreshTestStore.resetKey(testIp);
};
