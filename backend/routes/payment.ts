import crypto from 'crypto'
import { Response, Router } from 'express'
import Razorpay from 'razorpay'
import prisma from '../../database/prismaClient'
import { AuthRequest, requireAuth } from '../middleware/requireAuth'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY as string,
  key_secret: process.env.RAZORPAY_API_SECRET as string
})

type CreateOrderBody = {
  addressId: string
}

type VerifyPaymentBody = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

router.post('/order', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { addressId } = req.body as CreateOrderBody

    if (!addressId) {
      return res
        .status(400)
        .json({ message: 'Please select a delivery address' })
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId }
    })

    if (!address) {
      return res.status(400).json({ message: 'Invalid delivery address' })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Your Cart is Empty' })
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.price - (item.product.discount || 0)
      return sum + price * item.quantity
    }, 0)

    const shipping = 0
    const discount = 0
    const total = subtotal + shipping - discount

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(subtotal * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    })

    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        subtotal,
        shipping,
        discount,
        total,
        paymentMethod: 'UPI',
        status: 'PENDING',
        razorpayOrderId: razorpayOrder.id,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.product.price - (item.product.discount || 0)
          }))
        }
      }
    })
    res.json({
      orderId: razorpayOrder.id,
      internalOrderId: order.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_API_KEY
    })
  } catch (err) {
    console.error('Razorpay order creation failed', err)
    res.status(500).json({ message: 'Failed to create payment order' })
  }
})

router.post('/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body as VerifyPaymentBody

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details' })
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_API_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: razorpay_order_id, userId },
        data: { status: 'CANCELLED' }
      })
      return res
        .status(400)
        .json({ message: 'Payment verification failed', verified: false })
    }

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id, userId }
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const orderWithItems = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED', razorpayPaymentId: razorpay_payment_id },
      include: { items: true }
    })

    await Promise.all(
      orderWithItems.items.map(item =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    )

    await prisma.cartItem.deleteMany({ where: { userId } })
    res.json({ verified: true, orderId: order.id })
  } catch (err) {
    console.error('Payment verification error', err)
    res.status(500).json({ messaage: 'verification failed' })
  }
})

export default router
