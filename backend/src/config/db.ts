import { PrismaClient } from '@prisma/client';
import { DATABASE } from '../constants/index.js';
import { isDevelopment } from './env.js';

const prisma = new PrismaClient({
  log: isDevelopment 
    ? [...DATABASE.LOG_LEVELS.DEVELOPMENT] 
    : [...DATABASE.LOG_LEVELS.PRODUCTION],
});

export default prisma;
