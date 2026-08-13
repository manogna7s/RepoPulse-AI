import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AnalysisProvider } from './context/AnalysisContext'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthCallback from './pages/AuthCallback'
import Compare from './pages/Compare'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ServerError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'history', element: <History /> },
      { path: 'compare', element: <Compare /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <RouterProvider router={router} />
      </AnalysisProvider>
    </AuthProvider>
  )
}

export default App
