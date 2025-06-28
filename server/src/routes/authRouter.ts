import {Router} from "express";
import {register, verifyEmail, login, logout, reVerifyEmail, refresh} from "../controllers/authHandler"
import {globalLimiter, loginRateLimiter, registerRateLimiter, refreshRateLimiter} from "../middleware/rateLimiter"
import {validate} from "../middleware/validateSchema"
import {registerSchema, loginSchema} from "../validators/authSchema"
const router = Router();

router.post("/register", validate(registerSchema), registerRateLimiter, register);
router.post("/verify-email", globalLimiter, verifyEmail);
router.post("/resend-email-confirmation", globalLimiter, reVerifyEmail)
router.post("/login", validate(loginSchema), loginRateLimiter, login)
router.post("/logout", logout)
router.post("/refresh", refreshRateLimiter, refresh)

export default router