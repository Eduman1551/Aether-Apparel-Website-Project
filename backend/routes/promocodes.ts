import { Router, Response } from 'express'
import prisma from '../../database/prismaClient'
import {
  requireAuth,
  requireAdmin,
  AuthRequest
} from '../middleware/requireAuth'

const router = Router()

router.post(
  '/validate',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { code, subtotal } = req.body

      if (!code) {
        return res.status(400).json({ message: 'Promo code is required' })
      }

      const promo = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() }
      })

      if (!promo || !promo.isActive) {
        return res.status(404).json({ message: 'Invalid promo code' })
      }

      if (promo.expiresAt && promo.expiresAt < new Date()) {
        return res.status(400).json({ message: 'This promo code has expired' })
      }

      const discount =
        promo.discountType === 'PERCENT'
          ? ((subtotal || 0) * promo.discountValue) / 100
          : promo.discountValue

      return res.status(200).json({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discount
      })
    } catch (error) {
      console.error('Validate promo error:', error)
      return res.status(500).json({ message: 'Something went wrong' })
    }
  }
)

router.get('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { code: 'asc' }
    })
    return res.status(200).json({ promoCodes })
  } catch (error) {
    console.error('Get promo codes error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, expiresAt, isActive } = req.body

    if (!code || !discountType || discountValue == null) {
      return res
        .status(400)
        .json({ message: 'code, discountType, and discountValue are required' })
    }
    if (!['PERCENT', 'FLAT'].includes(discountType)) {
      return res
        .status(400)
        .json({ message: 'discountType must be PERCENT or FLAT' })
    }

    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    })
    if (existing) {
      return res
        .status(409)
        .json({ message: 'A promo code with this name already exists' })
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? !!isActive : true
      }
    })

    return res.status(201).json({ promoCode })
  } catch (error) {
    console.error('Create promo code error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.patch('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }
    const { isActive } = req.body

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: { isActive }
    })

    return res.status(200).json({ promoCode })
  } catch (error) {
    console.error('Update promo code error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.promoCode.delete({ where: { id } })
    return res.status(200).json({ message: 'Promo code deleted' })
  } catch (error) {
    console.error('Delete promo code error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
