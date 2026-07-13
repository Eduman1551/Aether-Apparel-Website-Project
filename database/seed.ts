import bcrypt from 'bcrypt'
import 'dotenv/config'
import prisma from './prismaClient'

async function main() {
  console.log('Seeding database...')

  const categoryNames = [
    'T-Shirts',
    'Hoodies',
    'Cargo Pants',
    'Jackets',
    'Co-ord Sets'
  ]
  const categories: Record<string, { id: string }> = {}
  for (const name of categoryNames) {
    categories[name] = await prisma.category.create({ data: { name } })
  }

  const hashedPassword = await bcrypt.hash('password123', 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'USER'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Jon Snow',
        email: 'snow@example.com',
        password: hashedPassword,
        role: 'USER'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Iam Admin',
        email: 'admin@aetherapparel.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Ops Admin',
        email: 'ops@aetherapparel.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
  ])

  const productData: any[] = [
    {
      name: 'Classic Oversized Tee',
      description: 'A relaxed-fit oversized t-shirt made for everyday comfort.',
      material: '100% Cotton',
      care: 'Machine wash cold, tumble dry low.',
      price: 799,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White'],
      stock: 25,
      categoryId: categories['T-Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800'
      ]
    },
    {
      name: 'Graphic Print Tee',
      description: 'Bold graphic print tee for a statement casual look.',
      material: '100% Cotton',
      care: 'Machine wash cold, do not bleach.',
      price: 899,
      discount: 100,
      gender: 'MEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Gray'],
      stock: 15,
      categoryId: categories['T-Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'
      ]
    },
    {
      name: 'Essential Hoodie',
      description: 'Soft fleece hoodie built for cold, comfortable days.',
      material: '80% Cotton, 20% Polyester',
      care: 'Machine wash cold, hang dry.',
      price: 1799,
      discount: 200,
      gender: 'UNISEX',
      sizes: ['M', 'L', 'XL'],
      colors: ['Black', 'Sage Green'],
      stock: 20,
      categoryId: categories['Hoodies'].id,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'
      ]
    },
    {
      name: 'Zip-Up Hoodie',
      description: 'Full-zip hoodie with a modern minimal silhouette.',
      material: '80% Cotton, 20% Polyester',
      care: 'Machine wash cold, do not iron print.',
      price: 1999,
      discount: 0,
      gender: 'MEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Gray', 'Black'],
      stock: 12,
      categoryId: categories['Hoodies'].id,
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'
      ]
    },
    {
      name: 'Utility Cargo Pants',
      description: 'Multi-pocket cargo pants with a relaxed tapered fit.',
      material: '98% Cotton, 2% Elastane',
      care: 'Machine wash cold, inside out.',
      price: 1599,
      discount: 0,
      gender: 'MEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Beige', 'Black'],
      stock: 18,
      categoryId: categories['Cargo Pants'].id,
      images: [
        'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800'
      ]
    },
    {
      name: 'Wide Leg Cargo Pants',
      description: 'Wide leg cargo pants with a streetwear-inspired cut.',
      material: '100% Cotton',
      care: 'Machine wash cold.',
      price: 1699,
      discount: 150,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'],
      colors: ['Olive', 'Black'],
      stock: 10,
      categoryId: categories['Cargo Pants'].id,
      images: [
        'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=800'
      ]
    },
    {
      name: 'Minimal Bomber Jacket',
      description: 'Lightweight bomber jacket for everyday layering.',
      material: 'Polyester Shell, Cotton Lining',
      care: 'Dry clean recommended.',
      price: 2999,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['M', 'L', 'XL'],
      colors: ['Black'],
      stock: 8,
      categoryId: categories['Jackets'].id,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'
      ]
    },
    {
      name: 'Denim Jacket',
      description: 'Classic denim jacket with a slightly oversized fit.',
      material: '100% Denim Cotton',
      care: 'Machine wash cold, separately.',
      price: 2499,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Blue'],
      stock: 14,
      categoryId: categories['Jackets'].id,
      images: [
        'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=800'
      ]
    },
    {
      name: 'Ribbed Co-ord Set',
      description: 'Matching ribbed top and bottom set for a clean look.',
      material: '95% Cotton, 5% Elastane',
      care: 'Hand wash recommended.',
      price: 2199,
      discount: 300,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'],
      colors: ['Sage Green', 'White'],
      stock: 9,
      categoryId: categories['Co-ord Sets'].id,
      images: [
        'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800'
      ]
    },
    {
      name: 'Relaxed Co-ord Set',
      description: 'Oversized shirt and shorts co-ord for easy styling.',
      material: '100% Cotton',
      care: 'Machine wash cold.',
      price: 2399,
      discount: 0,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Beige'],
      stock: 11,
      categoryId: categories['Co-ord Sets'].id,
      images: [
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'
      ]
    }
  ]

  const products: any[] = []
  for (const data of productData) {
    const product = await prisma.product.create({ data })
    products.push(product)
  }

  await prisma.review.create({
    data: {
      productId: products[0].id,
      userId: users[0].id,
      rating: 5,
      comment: 'Super comfortable, fits true to size.'
    }
  })
  await prisma.review.create({
    data: {
      productId: products[0].id,
      userId: users[1].id,
      rating: 4,
      comment: 'Great quality fabric, would buy again.'
    }
  })
  await prisma.review.create({
    data: {
      productId: products[2].id,
      userId: users[1].id,
      rating: 5,
      comment: 'Perfect hoodie for winter, very warm.'
    }
  })

  // Promo Code
  await prisma.promoCode.create({
    data: {
      code: 'WELCOME20',
      discountType: 'PERCENT',
      discountValue: 20,
      isActive: true
    }
  })

  console.log('Seeding complete.')
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
