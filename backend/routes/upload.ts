import { Response, Router } from 'express'
import multer from 'multer'
import cloudinary from '../lib/cloudinaryConfig'
import { AuthRequest, requireAdmin } from '../middleware/requireAuth'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

function uploadBufferToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'aether-apparel/products' },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload failed'))
        }
        resolve(result.secure_url)
      }
    )
    stream.end(buffer)
  })
}

router.post(
  '/',
  requireAdmin,
  upload.array('images', 6),
  async (req: AuthRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[]

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No images provided' })
      }

      const urls = await Promise.all(
        files.map(file => uploadBufferToCloudinary(file.buffer))
      )

      return res.status(200).json({ urls })
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      return res.status(500).json({ message: 'Failed to upload images' })
    }
  }
)

export default router
