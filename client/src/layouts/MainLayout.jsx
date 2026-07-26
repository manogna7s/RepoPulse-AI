import { Outlet } from 'react-router-dom'
import Footer from '../components/common/Footer'
import GlobalLoadingBar from '../components/common/GlobalLoadingBar'
import Navbar from '../components/common/Navbar'
import OfflineBanner from '../components/common/OfflineBanner'
import ScrollToTopButton from '../components/common/ScrollToTopButton'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-slate-950"
      >
        Skip to main content
      </a>
      <GlobalLoadingBar />
      <OfflineBanner />
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}

export default MainLayout
