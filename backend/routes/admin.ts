import { Router, Response } from 'express'
import prisma from '../../database/prismaClient'
import { requireAdmin, AuthRequest } from '../middleware/requireAuth'

const router = Router()

router.use(requireAdmin)

router.post('/products', async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      material,
      care,
      price,
      discount,
      gender,
      sizes,
      colors,
      stock,
      categoryId,
      images
    } = req.body

    if (
      !name ||
      !description ||
      !material ||
      price === undefined ||
      price === null ||
      !gender ||
      !categoryId
    ) {
      return res
        .status(400)
        .json({ message: 'Missing required product fields' })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        material,
        care,
        price,
        discount: discount || 0,
        gender,
        sizes: sizes || [],
        colors: colors || [],
        stock: stock || 0,
        categoryId,
        images: images || []
      }
    })

    return res.status(201).json({ product })
  } catch (error) {
    console.error('Admin create product error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.patch('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }

    // Whitelist exactly the fields a product update is allowed to touch —
    // never pass req.body straight to Prisma, since an unexpected key
    // (typo, stale frontend field, a differently-shaped AI response, etc.)
    // throws an "Unknown argument" error and 500s the whole request.
    const {
      name,
      description,
      material,
      care,
      price,
      discount,
      gender,
      sizes,
      colors,
      stock,
      categoryId,
      images
    } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        material,
        care,
        price,
        discount,
        gender,
        sizes,
        colors,
        stock,
        categoryId,
        images
      }
    })

    return res.status(200).json({ product })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' })
    }
    console.error('Admin update product error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.delete('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.product.delete({ where: { id } })
    return res.status(200).json({ message: 'Product deleted' })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' })
    }
    console.error('Admin delete product error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: { include: { product: true } },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ orders })
  } catch (error) {
    console.error('Admin get orders error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.patch('/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string }
    const { status } = req.body

    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED'
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    })

    return res.status(200).json({ order })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' })
    }
    console.error('Admin update order error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/reports/sales', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: { items: true }
    })

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const totalOrders = orders.length

    const productSales: Record<string, number> = {}
    for (const order of orders) {
      for (const item of order.items) {
        productSales[item.productId] =
          (productSales[item.productId] || 0) + item.quantity
      }
    }

    const topProductIds = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, quantitySold]) => ({ productId, quantitySold }))

    const topProducts = await Promise.all(
      topProductIds.map(async entry => {
        const product = await prisma.product.findUnique({
          where: { id: entry.productId }
        })
        return { name: product?.name, quantitySold: entry.quantitySold }
      })
    )

    return res.status(200).json({
      totalRevenue,
      totalOrders,
      topProducts
    })
  } catch (error) {
    console.error('Admin sales report error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
