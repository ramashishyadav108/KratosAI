import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma from './config/db.js';
import { cleanupExpiredTokens } from './services/tokenService.js';

const PORT = process.env.PORT || 4000;

await prisma.$connect();
console.log('Database connected successfully');

setInterval(() => cleanupExpiredTokens(), 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
