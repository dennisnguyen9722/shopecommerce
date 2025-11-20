import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const pathname = req.nextUrl.pathname

  // Cho phép truy cập trang đăng nhập
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Chỉ bảo vệ route admin
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', 'admin')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Áp dụng middleware cho route nào?
export const config = {
  matcher: ['/admin/:path*']
}
