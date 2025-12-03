import axios from 'axios'
import { useAuthStore } from '@/src/store/authStore'
import { useAdminAuthStore } from '@/src/store/adminAuthStore'
import { getCookie } from 'cookies-next'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Phân loại Token chính xác
api.interceptors.request.use((config) => {
  // Lấy token từ các nguồn
  const adminToken = useAdminAuthStore.getState().token
  const userToken = useAuthStore.getState().token

  // ⚠️ Lưu ý: Cookie có thể bị ghi đè, nên chỉ dùng làm fallback cẩn thận
  const cookieToken = getCookie('token')

  // LOGIC CHỌN TOKEN:

  // 1. Nếu gọi vào /admin/* -> Ưu tiên Token Admin
  if (config.url?.startsWith('/admin') || config.url?.includes('/admin/')) {
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    } else if (cookieToken) {
      // Fallback cookie (chỉ hy vọng là cookie admin)
      config.headers.Authorization = `Bearer ${cookieToken}`
    }
  }
  // 2. Nếu gọi API public (Khách hàng) -> CHỈ DÙNG Token User
  else {
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`
    }
    // 🛑 QUAN TRỌNG:
    // Không được fallback sang cookieToken ở đây nếu bạn đang chạy localhost!
    // Vì cookieToken có thể là của Admin, gửi lên sẽ bị lỗi 401.
  }

  return config
})

// Response Interceptor: Xử lý khi token hết hạn (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      const isUrlAdmin =
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/admin')

      if (isUrlAdmin) {
        // Đang ở trang Admin -> Logout Admin
        useAdminAuthStore.getState().logoutAdmin()
      } else {
        // Đang ở trang Khách -> Logout Khách
        useAuthStore.getState().logout()
      }
    }
    return Promise.reject(error)
  }
)

export default api
