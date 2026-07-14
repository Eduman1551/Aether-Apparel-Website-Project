import { Router, Response } from 'express'
import prisma from '../../database/prismaClient'
import { requireAuth, AuthRequest } from '../middleware/requireAuth'

const router = Router()

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  console.log('userId:', req.userId)
  try {
    const { phone, street, city, state, pinCode, isDefault } = req.body

    if (!phone || !street || !city || !state || !pinCode) {
      return res
        .status(400)
        .json({ message: 'All address fields are required' })
    }

    const address = await prisma.address.create({
      data: {
        userId: req.userId as string,
        phone,
        street,
        city,
        state,
        pinCode,
        isDefault: !!isDefault
      }
    })

    return res.status(201).json({ address })
  } catch (error) {
    console.error('Create address error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.userId }
    })
    return res.status(200).json({ addresses })
  } catch (error) {
    console.error('Get addresses error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
