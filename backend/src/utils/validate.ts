import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const signupSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const emailSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
      return;
    }
    
    next();
  };
};
