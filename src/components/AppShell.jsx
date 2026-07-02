import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <main className="md:pl-60 pt-14 md:pt-0">{children}</main>
    </div>
  )
}
