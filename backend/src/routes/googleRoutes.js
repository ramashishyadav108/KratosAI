import express from 'express';
import passport from '../config/passport.js';
import { googleCallback } from '../controllers/googleController.js';

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=authentication_failed`,
  }),
  googleCallback
);

export default router;
