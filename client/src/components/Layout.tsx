import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import DemoBanner from './DemoBanner'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
