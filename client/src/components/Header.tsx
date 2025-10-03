import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Bell, User } from 'lucide-react'

const Header: React.FC = () => {
  const { user } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-charcoal">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600">
            Analyze tax-delinquent properties for investment opportunities
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
