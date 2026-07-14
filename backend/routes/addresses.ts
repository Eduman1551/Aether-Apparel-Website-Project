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

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string } // <-- cast here
    const { phone, street, city, state, pinCode, isDefault } = req.body

    const address = await prisma.address.findFirst({
      where: { id, userId: req.userId }
    })
    if (!address) return res.status(404).json({ message: 'Address not found' })

    const updated = await prisma.address.update({
      where: { id },
      data: { phone, street, city, state, pinCode, isDefault: !!isDefault }
    })
    return res.status(200).json({ address: updated })
  } catch (error) {
    console.error('Update address error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string } // <-- cast here
    const address = await prisma.address.findFirst({
      where: { id, userId: req.userId }
    })
    if (!address) return res.status(404).json({ message: 'Address not found' })

    await prisma.address.delete({ where: { id } })
    return res.status(200).json({ message: 'Address deleted' })
  } catch (error) {
    console.error('Delete address error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
