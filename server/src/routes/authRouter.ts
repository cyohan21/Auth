import {Router} from "express";
import {register, verifyEmail, login, logout, reVerifyEmail, refresh} from "../controllers/authHandler"
import {globalLimiter, loginRateLimiter, registerRateLimiter, refreshRateLimiter} from "../middleware/rateLimiter"
const router = Router();

router.post("/register", registerRateLimiter, register);
router.post("/verify-email", globalLimiter, verifyEmail);
router.post("/resend-email-confirmation", globalLimiter, reVerifyEmail)
router.post("/login", loginRateLimiter, login)
router.post("/logout", logout)
router.post("/refresh", refreshRateLimiter, refresh)

export default router