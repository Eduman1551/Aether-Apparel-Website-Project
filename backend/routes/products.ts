import { Router } from 'express'
import prisma from '../../database/prismaClient'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const {
      category,
      gender,
      color,
      size,
      minPrice,
      maxPrice,
      inStock,
      sort,
      search
    } = req.query

    const where: any = {}

    if (category) {
      where.category = { name: category as string }
    }
    if (gender) {
      where.gender = (gender as string).toUpperCase()
    }
    if (color) {
      where.colors = { has: color as string }
    }
    if (size) {
      where.sizes = { has: (size as string).toUpperCase() }
    }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }
    if (inStock === 'true') {
      where.stock = { gt: 0 }
    }
    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' }
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price_asc') orderBy = { price: 'asc' }
    if (sort === 'price_desc') orderBy = { price: 'desc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: { category: true, reviews: true }
    })

    return res.status(200).json({ products })
  } catch (error) {
    console.error('Get products error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: { include: { user: true } } }
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id }
      },
      take: 4
    })

    return res.status(200).json({ product, relatedProducts })
  } catch (error) {
    console.error('Get product error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
