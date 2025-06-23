import express from 'express';
import passport from 'passport';
import { googleAuthCallback } from '../Controllers/authController.js';

const router = express.Router();

// ✅ Route to initiate Google OAuth (with refresh token support)
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'],
    accessType: 'offline',
    prompt: 'consent',
  })
);

// ✅ Callback route for Google OAuth
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleAuthCallback
);

export default router;
