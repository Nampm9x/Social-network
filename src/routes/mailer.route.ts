import express from "express";
import { forgotPasswordCode, registerCode, verificationCode } from "../controllers/mailer.controller";

const router = express.Router();

router.post("/register", registerCode);
router.post("/reset-password", forgotPasswordCode);
router.post("/verification-reset-password-code", verificationCode);

export default router;