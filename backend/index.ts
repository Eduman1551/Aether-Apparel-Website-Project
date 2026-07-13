import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/auth'
import cartRoutes from './routes/cart'
import ordersRouters from './routes/orders'
import productRoutes from './routes/products'

const app = express()
app.use(cookieParser())
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))

app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRouters)

app
  .listen(5000, () => {
    console.log('Running on port 5000...')
  })
  .on('error', err => {
    console.error('Server failed to start:', err)
  })
