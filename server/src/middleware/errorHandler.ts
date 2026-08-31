import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
  }
  const status = typeof (err as { status?: unknown })?.status === 'number' ? (err as { status: number }).status : 500;
  if (status >= 500) {
    // Server/upstream errors (e.g. a Gemini API failure) can carry internal
    // details in err.message -- log them, but never forward them to the
    // client. Only genuinely client-facing errors (4xx, thrown with an
    // explicit status) are safe to echo back verbatim.
    console.error(err);
    return res.status(status).json({ error: 'Something went wrong. Please try again.' });
  }
  const message = err instanceof Error ? err.message : 'Bad request';
  res.status(status).json({ error: message });
}
