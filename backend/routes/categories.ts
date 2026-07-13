import { Router, Response } from 'express'
import prisma from '../../database/prismaClient'

const router = Router()

router.get('/', async (req, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    return res.status(200).json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
