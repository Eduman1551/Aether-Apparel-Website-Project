import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import addressRoutes from './routes/addresses'
import adminRoutes from './routes/admin'
import adminAiProductRoutes from './routes/adminAiProduct'
import authRoutes from './routes/auth'
import bannerRoutes from './routes/banners'
import cartRoutes from './routes/cart'
import categoryRoutes from './routes/categories'
import ordersRouters from './routes/orders'
import paymentRoutes from './routes/payment'
import productRoutes from './routes/products'
import reviewRoutes from './routes/reviews'
import userRoutes from './routes/users'
import promocodeRoutes from './routes/promocodes'
import uploadRoutes from './routes/upload'

const app = express()
app.use(express.json())

app.use(cookieParser())
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))

app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRouters)
app.use('/addresses', addressRoutes)
app.use('/admin', adminRoutes)
app.use('/categories', categoryRoutes)
app.use('/users', userRoutes)
app.use('/reviews', reviewRoutes)
app.use('/banners', bannerRoutes)
app.use('/admin/products/ai-create', adminAiProductRoutes)
app.use('/payment', paymentRoutes)
app.use('/promo-codes', promocodeRoutes)
app.use('/admin/upload', uploadRoutes)

app.listen(5000, () => {
  console.log('Running on port 5000...')
})
