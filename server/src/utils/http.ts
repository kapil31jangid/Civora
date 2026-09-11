import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export function asyncRoute<T extends Request>(handler: (req: T, res: Response) => Promise<unknown>) {
  return (req: T, res: Response, next: NextFunction) => void handler(req, res).catch(next)
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'Please check the request fields and try again.' })
    return
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message })
    return
  }
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    res.status(400).json({ error: 'The request body must be valid JSON.' })
    return
  }
  res.status(500).json({ error: 'Civora encountered an unexpected error. Please try again.' })
}
