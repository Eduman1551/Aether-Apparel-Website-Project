import { Router, Response } from 'express'
import prisma from '../../database/prismaClient'
import { requireAuth, AuthRequest } from '../middleware/requireAuth'

const router = Router()

router.patch('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { phone } = req.body

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return res
        .status(400)
        .json({ message: 'A valid phone number is required' })
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { phone: phone.trim() },
      select: { id: true, name: true, email: true, phone: true, role: true }
    })

    return res.status(200).json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
