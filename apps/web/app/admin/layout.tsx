import ReactQueryProvider from '@/src/providers/ReactQueryProvider'
import { Toaster } from 'sonner'

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <Toaster richColors />
      {children}
    </ReactQueryProvider>
  )
}
