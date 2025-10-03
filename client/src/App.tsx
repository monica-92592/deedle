// React import not needed in modern React
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PropertyProvider } from './contexts/PropertyContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import DebugInfo from './components/DebugInfo'
import DemoMode from './components/DemoMode'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import Analytics from './pages/Analytics'
import Watchlist from './pages/Watchlist'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PropertyProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
              {/* Demo route - no authentication required */}
              <Route path="/" element={<DemoMode />} />
              <Route path="/demo" element={<DemoMode />} />
              
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="upload" element={<Upload />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/:id" element={<PropertyDetail />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="watchlist" element={<Watchlist />} />
              </Route>
            </Routes>
            <DebugInfo />
          </div>
        </Router>
      </PropertyProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
