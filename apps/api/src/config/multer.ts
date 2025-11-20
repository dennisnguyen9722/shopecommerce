import multer from 'multer'

// Multer dùng memory storage để nhận file dạng buffer
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})
