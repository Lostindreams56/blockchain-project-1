import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { formatErrorResponse } from '../utils/apiResponse.js';

/**
 * Strong password criteria:
 * - At least 8 characters
 * - At least 1 lowercase letter
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 */
const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[0-9]/, 'Password must include at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must include at least one special character');

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
    password: passwordValidation,
    passwordConfirmation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.passwordConfirmation !== undefined) {
        return data.password === data.passwordConfirmation;
      }
      return true;
    },
    {
      message: 'Passwords do not match',
      path: ['passwordConfirmation'],
    }
  );

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Middleware factory to validate request body against a Zod schema.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json(
        formatErrorResponse(
          fieldErrors,
          'Validation failed. Please check the submitted fields.'
        )
      );
      return;
    }

    req.body = result.data;
    next();
  };
}
