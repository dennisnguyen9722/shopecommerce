// src/lib/upload.ts
import api from '@/src/lib/api'

// Hàm này chuyên để upload 1 file và trả về URL
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  // Backend của bạn đang yêu cầu key là 'images' (dựa theo code ImageUploader cũ)
  formData.append('images', file)

  try {
    const res = await api.post('/admin/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // API của bạn trả về { images: [{ url, public_id }, ...] }
    // Chúng ta lấy URL của ảnh đầu tiên
    if (res.data && res.data.images && res.data.images.length > 0) {
      return res.data.images[0].url
    }

    throw new Error('Không nhận được URL ảnh từ server')
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
