import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

// A layout owns UI shared by multiple pages. Outlet is the placeholder where
// React Router renders the page matching the current URL.
function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
