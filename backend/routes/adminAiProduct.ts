import { FunctionCallingConfigMode, GoogleGenAI, Type } from '@google/genai'
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../../database/prismaClient'
import { requireAdmin } from '../middleware/requireAuth'

const AiProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(400),
  material: z.string().min(2).max(100),
  care: z.string().max(200).optional(),
  price: z.number().positive(),
  discount: z.number().nonnegative().default(0),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX']),
  sizes: z.array(z.enum(['S', 'M', 'L', 'XL'])).min(1),
  colors: z.array(z.string().min(2).max(30)).min(1),
  stock: z.number().int().nonnegative(),
  categoryName: z.string().min(1)
})

const router = Router()
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

router.post('/', requireAdmin, async (req, res) => {
  const { prompt } = req.body

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return res
      .status(400)
      .json({ message: 'Describe the product in a sentence or two' })
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true }
  })

  const categoryNames = categories.map(c => c.name)

  const addProductDeclaration = {
    name: 'add_product',
    description: 'Add a new clothing product to the Aether Apparel Catalog',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Short Product Name' },
        description: {
          type: Type.STRING,
          description: '1-3 Sentence product Description'
        },
        material: { type: Type.STRING, description: 'e.g. 100% Cotton' },
        care: {
          type: Type.STRING,
          description: 'Care instructions, if mentioned'
        },
        price: {
          type: Type.NUMBER,
          description: 'Price in INR, no currency symbol'
        },
        discount: {
          type: Type.NUMBER,
          description: 'Discount amount in INR, 0 if not mentioned'
        },
        gender: { type: Type.STRING, enum: ['MEN', 'WOMEN', 'UNISEX'] },
        sizes: {
          type: Type.ARRAY,
          items: { type: Type.STRING, enum: ['S', 'M', 'L', 'XL'] }
        },
        colors: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'e.g. Black, Sage Green'
        },
        stock: {
          type: Type.NUMBER,
          description: 'Stock quantity, default 10 if not mentioned'
        },
        categoryName: {
          type: Type.STRING,
          enum: categoryNames,
          description: 'Pick the closest matching existing category'
        }
      },
      required: [
        'name',
        'description',
        'material',
        'price',
        'gender',
        'sizes',
        'colors',
        'stock',
        'categoryName'
      ]
    }
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are helping an admin add a product to an online clothing store called Aether Apparel. Extract the product details from this description and call add_product. Only choose categoryName from the provided list. If price isn't mentioned, estimate something reasonable. Default stock to 10 and discount to 0 if not mentioned.\n\nDescription: "${prompt}"`,
      config: {
        tools: [{ functionDeclarations: [addProductDeclaration] }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: ['add_product']
          }
        }
      }
    })

    const call = response.functionCalls?.[0]

    if (!call || !call.args) {
      return res.status(422).json({
        message: "Couldn't understand that description. Try adding more detail."
      })
    }

    const parsed = AiProductSchema.safeParse(call.args)

    if (!parsed.success) {
      return res.status(422).json({
        message: "AI response didn't match the expected product format."
      })
    }
    const category = categories.find(c => c.name === parsed.data.categoryName)

    if (!category) {
      return res.status(422).json({
        message: "AI picked a category that doesn't exist. Try rephrasing."
      })
    }
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        material: parsed.data.material,
        care: parsed.data.care || null,
        price: parsed.data.price,
        discount: parsed.data.discount ?? 0,
        gender: parsed.data.gender,
        sizes: parsed.data.sizes,
        colors: parsed.data.colors,
        stock: parsed.data.stock,
        categoryId: category.id,
        images: []
      },
      include: { category: true }
    })
    res.status(201).json({ product })
  } catch (err) {
    console.error('AI product creation failed:', err)
    res
      .status(500)
      .json({ message: 'Something went wrong creating the product.' })
  }
})

export default router
