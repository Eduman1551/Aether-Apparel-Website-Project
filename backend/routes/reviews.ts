import { Router, Response } from 'express'
import prisma from '../../database/prismaClient'
import { requireAuth, AuthRequest } from '../middleware/requireAuth'

const router = Router()

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, comment } = req.body

    if (!productId || !rating) {
      return res
        .status(400)
        .json({ message: 'productId and rating are required' })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const existing = await prisma.review.findFirst({
      where: { productId, userId: req.userId }
    })
    if (existing) {
      return res
        .status(409)
        .json({ message: 'You have already reviewed this product' })
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.userId as string,
        rating,
        comment: comment || null
      },
      include: { user: true }
    })

    return res.status(201).json({ review })
  } catch (error) {
    console.error('Create review error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const isOwner = review.userId === req.userId
    const isAdmin = user?.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You cannot delete this review' })
    }

    await prisma.review.delete({ where: { id } })

    return res.status(200).json({ message: 'Review deleted' })
  } catch (error) {
    console.error('Delete review error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
