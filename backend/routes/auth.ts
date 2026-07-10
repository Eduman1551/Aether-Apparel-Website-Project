import bcrypt from 'bcrypt'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../../database/prisma'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET as string
const COOKIE_NAME = 'token'

function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are required' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone }
    })

    const token = generateToken(user.id)
    res.cookie(COOKIE_NAME, token, cookieOptions)

    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user.id)
    res.cookie(COOKIE_NAME, token, cookieOptions)

    return res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions)
  return res.status(200).json({ message: 'Logged out' })
})

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, phone: true, role:true}
    })
 
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    return res.status(200).json({ user })
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
})

export default router
