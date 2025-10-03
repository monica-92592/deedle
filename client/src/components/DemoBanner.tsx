import React from 'react'
import { DEMO_MODE } from '../config/api'

const DemoBanner: React.FC = () => {
  if (!DEMO_MODE) return null

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 text-center">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm font-medium">
          🚀 <strong>Demo Mode:</strong> This is a live demo of the Deedle tax property analysis platform. 
          Upload your own CSV files or explore the sample data to see the full functionality!
        </p>
      </div>
    </div>
  )
}

export default DemoBanner
