import { Request, Response, NextFunction } from 'express';
import { ErrorResHandler } from '../utils/responseHandlers';

/**
 * Dummy token for development.
 * Replace with real JWT / OAuth validation in production.
 */
const VALID_TOKEN = 'dummy-secret-token-2024';

/**
 * Middleware: validates Bearer token from the Authorization header.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    ErrorResHandler(res, 'Missing Authorization header', 401);
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    ErrorResHandler(res, 'Malformed Authorization header. Expected: Bearer <token>', 401);
    return;
  }

  const token = parts[1];
  if (token !== VALID_TOKEN) {
    ErrorResHandler(res, 'Invalid or expired token', 403);
    return;
  }

  next();
}
