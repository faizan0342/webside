import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { config } from './config.js';

export function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try { req.admin = jwt.verify(token, config.jwtSecret); next(); }
  catch { res.status(401).json({ message: 'Invalid or expired session' }); }
}
export const validate = schema => (req, _res, next) => { req.validated = schema.parse(req.body); next(); };
export function notFound(req, res) { res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }); }
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) return res.status(400).json({ message: 'Validation failed', errors: err.flatten().fieldErrors });
  if (err.code === 11000) return res.status(409).json({ message: 'That value already exists' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier' });
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
}
