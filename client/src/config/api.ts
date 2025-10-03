// API configuration for different environments
const getApiUrl = () => {
  // Check if we're in production (GitHub Pages)
  if (window.location.hostname === 'monica-92592.github.io') {
    // For production, you'll need to deploy your backend to a service like Railway, Render, or Heroku
    return 'https://your-backend-url.railway.app' // Replace with your actual backend URL
  }
  
  // Development environment
  return 'http://localhost:5000'
}

export const API_URL = getApiUrl()

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile'
  },
  UPLOAD: {
    CSV: '/api/upload/csv',
    DATASETS: '/api/upload/datasets'
  },
  PROPERTIES: {
    LIST: '/api/properties',
    DETAIL: (id: number) => `/api/properties/${id}`,
    WATCHLIST: (id: number) => `/api/properties/${id}/watchlist`,
    EXPORT: '/api/properties/export/csv'
  },
  ANALYSIS: {
    PORTFOLIO: (datasetId: number) => `/api/analysis/portfolio/${datasetId}`,
    TRENDS: (datasetId: number) => `/api/analysis/trends/${datasetId}`,
    LOCATION: (datasetId: number) => `/api/analysis/location/${datasetId}`,
    RISK: (datasetId: number) => `/api/analysis/risk/${datasetId}`
  }
}
