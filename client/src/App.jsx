import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AnalysisProvider } from './context/AnalysisContext'
import MainLayout from './layouts/MainLayout'
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
      { path: '*', element: <NotFound /> },
    ],
  },
])

function App() {
  return (
    <AnalysisProvider>
      <RouterProvider router={router} />
    </AnalysisProvider>
  )
}

export default App
