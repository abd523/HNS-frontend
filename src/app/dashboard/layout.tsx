import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import AuthGuard from '@/components/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="p-6 flex-1">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
