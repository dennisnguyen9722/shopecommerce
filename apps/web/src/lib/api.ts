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

// Response Interceptor: Xử lý khi token hết hạn (401) hoặc bị cấm (403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Bắt cả lỗi 401 (Hết hạn) và 403 (Không có quyền)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Kiểm tra xem code có đang chạy ở trình duyệt không
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname

        // Logic kiểm tra xem đang ở trang Admin hay trang User
        const isUrlAdmin = pathname.startsWith('/admin')

        if (isUrlAdmin) {
          // ==============================
          // 🛡️ XỬ LÝ CHO ADMIN
          // ==============================
          // Chỉ redirect nếu chưa ở trang login admin (tránh lặp vô tận)
          if (!pathname.includes('/admin/login')) {
            console.log(
              '🚨 Admin Token hết hạn - Đang Redirect về Login Admin...'
            )

            // 1. Logout xóa state
            useAdminAuthStore.getState().logoutAdmin()

            // 2. Đá về trang Login Admin (Kèm link redirect để quay lại sau khi login)
            window.location.href = `/admin/login?redirect=${encodeURIComponent(
              pathname
            )}`
          }
        } else {
          // ==============================
          // 👤 XỬ LÝ CHO KHÁCH HÀNG
          // ==============================
          if (!pathname.includes('/login')) {
            console.log('🚨 User Token hết hạn - Đang Redirect về Login...')

            // 1. Logout xóa state user
            useAuthStore.getState().logout()

            // 2. Đá về trang Login User
            window.location.href = `/login?redirect=${encodeURIComponent(
              pathname
            )}`
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
