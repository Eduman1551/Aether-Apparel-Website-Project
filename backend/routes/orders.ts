import { Router, Response } from 'express'
import prisma from '../../database/prismaClient'
import { requireAuth, AuthRequest } from '../middleware/requireAuth'

const router = Router()

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { addressId, paymentMethod, promoCode } = req.body

    if (!addressId || !paymentMethod) {
      return res
        .status(400)
        .json({ message: 'addressId and paymentMethod are required' })
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId }
    })
    if (!address || address.userId !== req.userId) {
      return res.status(404).json({ message: 'Address not found' })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.name}`
        })
      }
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.price - item.product.discount
      return sum + price * item.quantity
    }, 0)

    const shipping = subtotal > 999 ? 0 : 99

    let discount = 0
    let appliedPromoId: string | null = null

    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode }
      })
      if (
        !promo ||
        !promo.isActive ||
        (promo.expiresAt && promo.expiresAt < new Date())
      ) {
        return res
          .status(400)
          .json({ message: 'Invalid or expired promo code' })
      }
      discount =
        promo.discountType === 'PERCENT'
          ? (subtotal * promo.discountValue) / 100
          : promo.discountValue
      appliedPromoId = promo.id
    }

    const total = subtotal + shipping - discount

    const order = await prisma.order.create({
      data: {
        userId: req.userId as string,
        addressId,
        subtotal,
        shipping,
        discount,
        total,
        promoCodeId: appliedPromoId,
        paymentMethod,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.product.price - item.product.discount
          }))
        }
      },
      include: { items: true }
    })

    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    await prisma.cartItem.deleteMany({ where: { userId: req.userId } })

    return res.status(201).json({ order })
  } catch (error) {
    console.error('Create order error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { items: { include: { product: true } }, address: true },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, address: true }
    })

    if (!order || order.userId !== req.userId) {
      return res.status(404).json({ message: 'Order not found' })
    }

    return res.status(200).json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
