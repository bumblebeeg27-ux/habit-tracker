import { Request, Response, NextFunction } from 'express';

export function requireClientKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.APP_CLIENT_KEY;
  const provided = req.header('x-client-key');
  if (!expected || provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
