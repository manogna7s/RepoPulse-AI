import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AnalysisProvider } from './context/AnalysisContext'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Route definitions live together so navigation remains easy to understand as
// the product grows. The shared layout avoids repeating the header on pages.
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

// AnalysisProvider wraps the router so analysis results survive navigation
// between the landing page and the dashboard.
function App() {
  return (
    <AnalysisProvider>
      <RouterProvider router={router} />
    </AnalysisProvider>
  )
}

export default App
