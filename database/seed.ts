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
    'Co-ord Sets',
    'Shirts',
    'Joggers',
    'Dresses'
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
    // ---------------- Original 10 products (unchanged except where sizes needed no changes, they were fine) ----------------
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
    },

    // ---------------- 30 new products (sizes fixed) ----------------

    // T-Shirts (4 more → total 6)
    {
      name: 'Vintage Wash Tee',
      description: 'Soft washed t-shirt with a lived-in vintage feel.',
      material: '100% Cotton',
      care: 'Machine wash cold, inside out.',
      price: 849,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Faded Black', 'Heather Gray'],
      stock: 20,
      categoryId: categories['T-Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1562157873-8bc6e1a9c1a8?w=800'
      ]
    },
    {
      name: 'Cropped T-Shirt',
      description:
        'Trendy cropped length t-shirt designed to fit slightly shorter. Size up if between sizes.',
      material: '100% Cotton',
      care: 'Machine wash cold.',
      price: 699,
      discount: 50,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'], // replaced XS with S, kept M, L
      colors: ['White', 'Lavender'],
      stock: 18,
      categoryId: categories['T-Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800'
      ]
    },
    {
      name: 'Striped Long Sleeve Tee',
      description: 'Breton-striped long sleeve tee, a wardrobe staple.',
      material: '100% Cotton',
      care: 'Machine wash cold, do not bleach.',
      price: 999,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Navy/White', 'Black/White'],
      stock: 22,
      categoryId: categories['T-Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1576566588028-414520f5bfba?w=800'
      ]
    },
    {
      name: 'Pocket Tee',
      description: 'Minimalist tee with a single chest pocket.',
      material: '100% Cotton',
      care: 'Machine wash cold.',
      price: 799,
      discount: 0,
      gender: 'MEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Olive', 'Black'],
      stock: 25,
      categoryId: categories['T-Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
      ]
    },

    // Hoodies (4 more → total 6)
    {
      name: 'Pullover Hoodie',
      description: 'Classic pullover hoodie with a front kangaroo pocket.',
      material: '80% Cotton, 20% Polyester',
      care: 'Machine wash cold, hang dry.',
      price: 1899,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Heather Gray', 'Navy'],
      stock: 16,
      categoryId: categories['Hoodies'].id,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'
      ]
    },
    {
      name: 'Cropped Hoodie',
      description:
        'Boxy cropped hoodie with a raw hem, intended for a shorter fit. Consider ordering your usual size for a true cropped look.',
      material: '80% Cotton, 20% Polyester',
      care: 'Machine wash cold.',
      price: 1599,
      discount: 100,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'], // XS removed
      colors: ['Sage Green', 'Cream'],
      stock: 12,
      categoryId: categories['Hoodies'].id,
      images: [
        'https://images.unsplash.com/photo-1578762560042-46ad127c95ea?w=800'
      ]
    },
    {
      name: 'Heavyweight Hoodie',
      description: 'Thick 450gsm hoodie for maximum warmth and durability.',
      material: '85% Cotton, 15% Polyester',
      care: 'Machine wash cold, tumble dry low.',
      price: 2499,
      discount: 0,
      gender: 'MEN',
      sizes: ['M', 'L', 'XL'], // XXL removed
      colors: ['Charcoal', 'Forest Green'],
      stock: 10,
      categoryId: categories['Hoodies'].id,
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'
      ]
    },
    {
      name: 'Colorblock Hoodie',
      description: 'Bold colorblock design with contrast sleeves.',
      material: '80% Cotton, 20% Polyester',
      care: 'Machine wash cold, inside out.',
      price: 2199,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black/White', 'Navy/Red'],
      stock: 14,
      categoryId: categories['Hoodies'].id,
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'
      ]
    },

    // Cargo Pants (3 more → total 5)
    {
      name: 'Slim Fit Cargo Pants',
      description: 'Slim-cut cargo pants with stretch for movement.',
      material: '97% Cotton, 3% Elastane',
      care: 'Machine wash cold.',
      price: 1799,
      discount: 0,
      gender: 'MEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Tan'],
      stock: 15,
      categoryId: categories['Cargo Pants'].id,
      images: [
        'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800'
      ]
    },
    {
      name: 'Parachute Cargo Pants',
      description: 'Lightweight parachute fabric cargo with adjustable cuffs.',
      material: 'Nylon',
      care: 'Hand wash cold.',
      price: 1999,
      discount: 150,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L'],
      colors: ['Silver', 'Black'],
      stock: 10,
      categoryId: categories['Cargo Pants'].id,
      images: [
        'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=800'
      ]
    },
    {
      name: 'Cargo Joggers',
      description: 'Jogger-style cargo pants with elastic ankle cuffs.',
      material: '100% Cotton',
      care: 'Machine wash cold.',
      price: 1699,
      discount: 0,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'], // XS removed
      colors: ['Olive', 'Gray'],
      stock: 12,
      categoryId: categories['Cargo Pants'].id,
      images: [
        'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800'
      ]
    },

    // Jackets (3 more → total 5)
    {
      name: 'Puffer Jacket',
      description: 'Quilted puffer jacket filled with synthetic down.',
      material: 'Polyester Shell, Down-Alternative Fill',
      care: 'Machine wash cold.',
      price: 3499,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy'],
      stock: 7,
      categoryId: categories['Jackets'].id,
      images: [
        'https://images.unsplash.com/photo-1544923246-77307e9460a7?w=800'
      ]
    },
    {
      name: 'Oversized Blazer',
      description: 'Relaxed tailored blazer that dresses up any outfit.',
      material: 'Polyester Blend',
      care: 'Dry clean only.',
      price: 3999,
      discount: 500,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'],
      colors: ['Beige', 'Charcoal'],
      stock: 6,
      categoryId: categories['Jackets'].id,
      images: [
        'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=800'
      ]
    },
    {
      name: 'Varsity Jacket',
      description:
        'Collegiate-inspired varsity jacket with faux leather sleeves.',
      material: 'Wool Blend Body, Faux Leather Sleeves',
      care: 'Spot clean.',
      price: 3299,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['M', 'L', 'XL'],
      colors: ['Black/White', 'Green/Cream'],
      stock: 9,
      categoryId: categories['Jackets'].id,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'
      ]
    },

    // Co-ord Sets (3 more → total 5)
    {
      name: 'Linen Co-ord Set',
      description: 'Breezy linen shirt and shorts set for warm days.',
      material: '100% Linen',
      care: 'Hand wash cold.',
      price: 2599,
      discount: 0,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'],
      colors: ['White', 'Sand'],
      stock: 8,
      categoryId: categories['Co-ord Sets'].id,
      images: [
        'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800'
      ]
    },
    {
      name: 'Sporty Co-ord Set',
      description: 'Tracksuit-inspired zip-up jacket and jogger set.',
      material: 'Polyester Blend',
      care: 'Machine wash cold.',
      price: 2799,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy'],
      stock: 13,
      categoryId: categories['Co-ord Sets'].id,
      images: [
        'https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=800'
      ]
    },
    {
      name: 'Knit Co-ord Set',
      description:
        'Cozy knitted top and maxi skirt co-ord for chilly evenings.',
      material: 'Acrylic Knit',
      care: 'Hand wash cold, lay flat to dry.',
      price: 3299,
      discount: 200,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'],
      colors: ['Camel', 'Gray'],
      stock: 7,
      categoryId: categories['Co-ord Sets'].id,
      images: [
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'
      ]
    },

    // Shirts (5 items, new category)
    {
      name: 'Oxford Button-Down Shirt',
      description: 'Crisp oxford shirt, perfect for smart-casual looks.',
      material: '100% Cotton',
      care: 'Machine wash cold, iron if needed.',
      price: 1399,
      discount: 0,
      gender: 'MEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Light Blue'],
      stock: 18,
      categoryId: categories['Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800'
      ]
    },
    {
      name: 'Linen Shirt',
      description: 'Breathable linen shirt with a relaxed fit.',
      material: '100% Linen',
      care: 'Hand wash or delicate cycle.',
      price: 1599,
      discount: 100,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Beige', 'White'],
      stock: 14,
      categoryId: categories['Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800'
      ]
    },
    {
      name: 'Cuban Collar Shirt',
      description: 'Retro-inspired open-collar shirt for summer.',
      material: 'Viscose',
      care: 'Machine wash cold.',
      price: 1299,
      discount: 0,
      gender: 'MEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Pine Green'],
      stock: 16,
      categoryId: categories['Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800'
      ]
    },
    {
      name: 'Oversized Flannel Shirt',
      description: 'Heavyweight flannel shirt, can be worn open or closed.',
      material: '100% Cotton Flannel',
      care: 'Machine wash cold.',
      price: 1799,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['M', 'L', 'XL'],
      colors: ['Red/Black', 'Blue/Green'],
      stock: 12,
      categoryId: categories['Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800'
      ]
    },
    {
      name: 'Half-Sleeve Shirt',
      description: 'Casual short-sleeve button-up ideal for beach days.',
      material: 'Cotton-Linen Blend',
      care: 'Machine wash cold.',
      price: 1199,
      discount: 0,
      gender: 'MEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Navy'],
      stock: 20,
      categoryId: categories['Shirts'].id,
      images: [
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800'
      ]
    },

    // Joggers (4 items, new category)
    {
      name: 'Tech Fleece Joggers',
      description: 'Lightweight tech fleece joggers with zip pockets.',
      material: 'Polyester, Cotton Blend',
      care: 'Machine wash cold.',
      price: 1999,
      discount: 0,
      gender: 'MEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Heather Gray'],
      stock: 14,
      categoryId: categories['Joggers'].id,
      images: [
        'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800'
      ]
    },
    {
      name: 'Cotton Joggers',
      description: 'Everyday french terry joggers with a relaxed fit.',
      material: '100% Cotton',
      care: 'Machine wash cold.',
      price: 1499,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Beige', 'Olive'],
      stock: 18,
      categoryId: categories['Joggers'].id,
      images: [
        'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800'
      ]
    },
    {
      name: 'Tapered Joggers',
      description: 'Slim-fit joggers with a tapered leg and ribbed cuffs.',
      material: '80% Cotton, 20% Polyester',
      care: 'Machine wash cold.',
      price: 1699,
      discount: 50,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'], // XS removed
      colors: ['Dusty Pink', 'Charcoal'],
      stock: 11,
      categoryId: categories['Joggers'].id,
      images: [
        'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800'
      ]
    },
    {
      name: 'Cuffed Joggers',
      description: 'Classic joggers with an elastic waistband and ankle cuffs.',
      material: 'Cotton Blend',
      care: 'Machine wash cold.',
      price: 1599,
      discount: 0,
      gender: 'UNISEX',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Navy', 'Black'],
      stock: 15,
      categoryId: categories['Joggers'].id,
      images: [
        'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800'
      ]
    },

    // Dresses (4 items, new category)
    {
      name: 'Satin Slip Dress',
      description: 'Elegant midi slip dress with adjustable straps.',
      material: 'Satin',
      care: 'Hand wash cold.',
      price: 2499,
      discount: 0,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'], // XS removed
      colors: ['Champagne', 'Black'],
      stock: 9,
      categoryId: categories['Dresses'].id,
      images: [
        'https://images.unsplash.com/photo-1560243563-062bfc7d0f7e?w=800'
      ]
    },
    {
      name: 'Shirt Dress',
      description: 'Oversized shirt dress with a waist tie belt.',
      material: 'Cotton Poplin',
      care: 'Machine wash cold.',
      price: 2199,
      discount: 200,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'],
      colors: ['White', 'Sky Blue'],
      stock: 10,
      categoryId: categories['Dresses'].id,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
      ]
    },
    {
      name: 'Tiered Maxi Dress',
      description: 'Flowy tiered maxi dress with a smocked bodice.',
      material: 'Cotton',
      care: 'Hand wash cold.',
      price: 2699,
      discount: 0,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Rust', 'Sage'],
      stock: 8,
      categoryId: categories['Dresses'].id,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
      ]
    },
    {
      name: 'Mini Bodycon Dress',
      description: 'Stretchy ribbed mini dress that hugs the body.',
      material: '95% Cotton, 5% Elastane',
      care: 'Machine wash cold.',
      price: 1399,
      discount: 0,
      gender: 'WOMEN',
      sizes: ['S', 'M', 'L'], // XS removed
      colors: ['Black', 'Burgundy'],
      stock: 14,
      categoryId: categories['Dresses'].id,
      images: [
        'https://images.unsplash.com/photo-1560243563-062bfc7d0f7e?w=800'
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
