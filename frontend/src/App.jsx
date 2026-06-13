import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import MenuShowcase from './pages/MenuShowcase'

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <div className="min-h-screen bg-china-beige">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MenuShowcase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin/*" element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
