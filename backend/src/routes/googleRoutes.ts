import express, { Router } from 'express';
import { googleAuth, googleCallback } from '../controllers/googleController.js';

const router: Router = express.Router();

// Initiate Google OAuth flow
router.get('/google', googleAuth);

// Handle Google OAuth callback
router.get('/google/callback', googleCallback);

export default router;
