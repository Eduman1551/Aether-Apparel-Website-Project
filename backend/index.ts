import express from 'express'

import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import cartRoutes from './routes/cart'
import ordersRouters from './routes/orders'

const app = express()

app.use("/auth", authRoutes)

app.listen(5000, ()=>{
  console.log("Running on port 5000...")
})