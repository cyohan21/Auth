import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  standardHeaders: true, // Uses new and modern headers
  legacyHeaders: false, // Disables old ones
  message: "Too many requests. Please try again later."
});


export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts. Try again in 5 minutes."
});

export const registerRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many signup attempts. Try again in 10 minutes."
});

export const refreshRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many refresh requests. Please slow down."
});