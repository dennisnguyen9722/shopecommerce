import Navbar from './components/navbar/Navbar'

export default function StorefrontLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />

      {/* để tránh navbar đè nội dung */}
      <div>{children}</div>
    </>
  )
}
