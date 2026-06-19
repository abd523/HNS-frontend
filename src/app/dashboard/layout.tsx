import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header እዚህ ጋር ይገባል */}
        <header className="bg-white shadow p-4 font-semibold text-lg">Hospital Management Dashboard</header>
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  )
}