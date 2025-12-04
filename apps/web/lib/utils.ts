import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(str: string): string {
  if (!str) return ''

  return str
    .toLowerCase() // Chuyển thành chữ thường
    .normalize('NFD') // Chuẩn hóa chuỗi Unicode để tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu thanh
    .replace(/[đĐ]/g, 'd') // Chuyển chữ đ/Đ thành d
    .replace(/([^0-9a-z-\s])/g, '-') // Thay thế các ký tự đặc biệt (/, _, &,...) bằng dấu gạch ngang
    .replace(/(\s+)/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Xóa các dấu gạch ngang liên tiếp
    .replace(/^-+|-+$/g, '') // Xóa dấu gạch ngang ở đầu và cuối chuỗi
}
