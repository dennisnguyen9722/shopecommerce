import axios from 'axios'
// 👇 1. Import store để lấy token
import { useAuthStore } from '@/src/store/authStore'

function normalizeBaseURL(url?: string) {
  try {
    if (!url) return undefined

    // Ensure absolute URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url
    }

    return new URL(url).toString()
  } catch {
    return url
  }
}

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const baseURL = normalizeBaseURL(rawBaseURL)

const serverApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 👇 2. THÊM ĐOẠN INTERCEPTOR NÀY (QUAN TRỌNG NHẤT)
// Tác dụng: Trước khi gửi request đi, nó tự động lấy Token từ kho (Store) dán vào Header
serverApi.interceptors.request.use(
  (config) => {
    // Lấy token trực tiếp từ State của Zustand (cách lấy khi không ở trong Component React)
    const token = useAuthStore.getState().token

    if (token) {
      // Gắn vào Header: Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default serverApi
