import { Outlet } from 'react-router-dom'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'

// A layout owns UI shared by multiple pages. Outlet is the placeholder where
// React Router renders the page matching the current URL. flex-col + flex-1
// keeps the footer at the bottom even on short pages.
function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
