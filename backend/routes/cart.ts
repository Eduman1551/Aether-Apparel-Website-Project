import { Router } from 'express'
import prisma from '../../database/prismaClient'
import { AuthRequest, requireAuth } from '../middleware/requireAuth'

const router = Router()

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { product: true }
    })

    return res.status(200).json({ cartItems })
  } catch (error) {
    console.error('Get cart error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { productId, size, color, quantity } = req.body

    if (!productId || !size || !color) {
      return res
        .status(400)
        .json({ message: 'productId, size, and color are required' })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size_color: {
          userId: req.userId as string,
          productId,
          size,
          color
        }
      }
    })

    let cartItem
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) }
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.userId as string,
          productId,
          size,
          color,
          quantity: quantity || 1
        }
      })
    }

    return res.status(201).json({ cartItem })
  } catch (error) {
    console.error('Add to cart error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string }
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' })
    }

    const cartItem = await prisma.cartItem.findUnique({ where: { id } })
    if (!cartItem || cartItem.userId !== req.userId) {
      return res.status(404).json({ message: 'Cart item not found' })
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    })

    return res.status(200).json({ cartItem: updated })
  } catch (error) {
    console.error('Update cart error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string }

    const cartItem = await prisma.cartItem.findUnique({ where: { id } })
    if (!cartItem || cartItem.userId !== req.userId) {
      return res.status(404).json({ message: 'Cart item not found' })
    }

    await prisma.cartItem.delete({ where: { id } })

    return res.status(200).json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Remove cart item error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
