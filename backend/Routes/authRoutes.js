import express from 'express';
import passport from 'passport';
import { googleAuthCallback } from '../Controllers/authController.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  setPassword,
} from '../Controllers/authLocalController.js';

const router = express.Router();

// ✅ Route to initiate Google OAuth (with refresh token support)
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send','https://www.googleapis.com/auth/gmail.readonly'],
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


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.post('/set-password',setPassword)


export default router;
