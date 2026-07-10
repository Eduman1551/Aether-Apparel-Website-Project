import {Router} from 'express'

const router = Router()

router.get('/login', (req,res)=>{
  res.send("Login Page")
})

router.get('/register', (req,res)=>{
  res.send("SignUp Page")
})

export default router