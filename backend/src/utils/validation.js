import { z } from 'zod';
import { UserRole } from '../models/user.model.js';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[5-9]\d{9}$/, 'Invalid mobile number. Must be 10 digits starting with 5,6,7,8 or 9'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').optional(),
});
