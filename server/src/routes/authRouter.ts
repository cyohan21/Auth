import {Router} from "express";
import {register, verifyEmail, login, logout, reVerifyEmail, refresh} from "../controllers/authHandler"
const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-email-confirmation", reVerifyEmail)
router.post("/login", login)
router.post("/logout", logout)
router.post("/refresh", refresh)

export default router