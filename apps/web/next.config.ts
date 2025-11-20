/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
        // pathname: '/de3olloc4/**', // có thể thêm nếu muốn giới hạn path
      }
    ]
    // hoặc cách đơn giản hơn:
    // domains: ['res.cloudinary.com'],
  }
}

export default nextConfig
