import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../../database/prismaClient'

const JWT_SECRET = process.env.JWT_SECRET as string

export interface AuthRequest extends Request {
  userId?: string
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  requireAuth(req, res, async () => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId } })

      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access only' })
      }

      next()
    } catch {
      return res.status(500).json({ message: 'Something went wrong' })
    }
  })
}
