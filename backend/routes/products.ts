import {Router} from 'express'

const router = Router()

router.get('/', (req,res)=>{
  res.send("All products")
})

router.get("/new", (req,res)=>{
  res.send("New Product addition form only to be viewed by admin")
})

router.get('/:id', (req,res)=>{
  res.send("Show page for particular product")
})

router.get('/:id/edit', (req,res)=>{
  res.send("Edit product page only to be viewed by admin")
})

export default router