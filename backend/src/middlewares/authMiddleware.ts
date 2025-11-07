import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
    return;
  }

  try {
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded as any;
    next();
  } catch (error) {
    if ((error as Error).name === 'TokenExpiredError') {
      res.status(401).json({ 
        success: false, 
        message: 'Access token expired' 
      });
      return;
    }
    res.status(403).json({ 
      success: false, 
      message: 'Invalid access token' 
    });
  }
};
