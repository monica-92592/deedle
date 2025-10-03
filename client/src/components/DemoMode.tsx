import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, DollarSign, Calendar, Building, LogIn, UserPlus } from 'lucide-react'

interface PropertyInfo {
  apn: string
  address: string
  owner: string
  assessedValue: number
  taxOwed: number
  delinquencyAge: number
  propertyType: string
  lotSize: number
  yearBuilt: number
  bedrooms: number
  bathrooms: number
  squareFootage: number
  lastSaleDate: string
  lastSalePrice: number
}

const DemoMode: React.FC = () => {
  const [apn, setApn] = useState('')
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Mock property database for demo
  const mockProperties: PropertyInfo[] = [
    {
      apn: '123-456-789',
      address: '123 Main St, Anytown, CA 90210',
      owner: 'John Smith',
      assessedValue: 450000,
      taxOwed: 12500,
      delinquencyAge: 2,
      propertyType: 'Single Family',
      lotSize: 0.25,
      yearBuilt: 1995,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1850,
      lastSaleDate: '2018-03-15',
      lastSalePrice: 380000
    },
    {
      apn: '456-789-012',
      address: '456 Oak Ave, Anytown, CA 90210',
      owner: 'Jane Doe',
      assessedValue: 280000,
      taxOwed: 8500,
      delinquencyAge: 1,
      propertyType: 'Condo',
      lotSize: 0.1,
      yearBuilt: 2010,
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1200,
      lastSaleDate: '2019-07-22',
      lastSalePrice: 295000
    },
    {
      apn: '789-012-345',
      address: '789 Pine St, Anytown, CA 90210',
      owner: 'Bob Johnson',
      assessedValue: 320000,
      taxOwed: 15200,
      delinquencyAge: 3,
      propertyType: 'Single Family',
      lotSize: 0.3,
      yearBuilt: 1988,
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2200,
      lastSaleDate: '2017-11-08',
      lastSalePrice: 340000
    }
  ]

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPropertyInfo(null)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const property = mockProperties.find(p => p.apn === apn)
    
    if (property) {
      setPropertyInfo(property)
    } else {
      setError('Property not found. Try: 123-456-789, 456-789-012, or 789-012-345')
    }
    
    setLoading(false)
  }

  const calculateEquityRatio = (assessedValue: number, taxOwed: number) => {
    return ((assessedValue - taxOwed) / assessedValue * 100).toFixed(1)
  }

  const calculateInvestmentScore = (property: PropertyInfo) => {
    const equityRatio = parseFloat(calculateEquityRatio(property.assessedValue, property.taxOwed))
    const agePenalty = Math.min(property.delinquencyAge * 5, 20)
    const valueBonus = property.assessedValue > 300000 ? 10 : 0
    const typeBonus = property.propertyType === 'Single Family' ? 15 : 5
    
    return Math.max(0, Math.min(100, equityRatio - agePenalty + valueBonus + typeBonus))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Deedle</h1>
                <p className="text-sm text-gray-600">Tax Property Analysis Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Demo Mode
              </div>
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Property Lookup Demo
            </h2>
            <p className="text-gray-600">
              Enter an APN (Assessor's Parcel Number) to get property information
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={apn}
                  onChange={(e) => setApn(e.target.value)}
                  placeholder="Enter APN (e.g., 123-456-789)"
                  className="input-field"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Try these demo APNs:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {mockProperties.map((prop) => (
                <button
                  key={prop.apn}
                  onClick={() => setApn(prop.apn)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                >
                  {prop.apn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Property Results */}
        {propertyInfo && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Property Information</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Investment Score:</span>
                <span className="text-2xl font-bold text-primary">
                  {calculateInvestmentScore(propertyInfo).toFixed(0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Property Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Address:</span> {propertyInfo.address}</div>
                  <div><span className="font-medium">Owner:</span> {propertyInfo.owner}</div>
                  <div><span className="font-medium">Type:</span> {propertyInfo.propertyType}</div>
                  <div><span className="font-medium">Lot Size:</span> {propertyInfo.lotSize} acres</div>
                  <div><span className="font-medium">Year Built:</span> {propertyInfo.yearBuilt}</div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financial Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Assessed Value:</span> ${propertyInfo.assessedValue.toLocaleString()}</div>
                  <div><span className="font-medium">Tax Owed:</span> ${propertyInfo.taxOwed.toLocaleString()}</div>
                  <div><span className="font-medium">Equity Ratio:</span> {calculateEquityRatio(propertyInfo.assessedValue, propertyInfo.taxOwed)}%</div>
                  <div><span className="font-medium">Delinquency Age:</span> {propertyInfo.delinquencyAge} years</div>
                </div>
              </div>

              {/* Property Specs */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Property Specs
                </h4>
                <div className="space-y-2 text-sm">
                <div><span className="font-medium">Bedrooms:</span> {propertyInfo.bedrooms.toString()}</div>
                <div><span className="font-medium">Bathrooms:</span> {propertyInfo.bathrooms.toString()}</div>
                  <div><span className="font-medium">Square Feet:</span> {propertyInfo.squareFootage.toLocaleString()}</div>
                  <div><span className="font-medium">Last Sale:</span> {propertyInfo.lastSaleDate}</div>
                  <div><span className="font-medium">Sale Price:</span> ${propertyInfo.lastSalePrice.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Investment Analysis */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Investment Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Equity Ratio:</span>
                  <span className="ml-2 text-blue-600">{calculateEquityRatio(propertyInfo.assessedValue, propertyInfo.taxOwed)}%</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Investment Score:</span>
                  <span className="ml-2 text-blue-600">{calculateInvestmentScore(propertyInfo).toFixed(0)}/100</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Risk Level:</span>
                  <span className="ml-2 text-blue-600">
                    {calculateInvestmentScore(propertyInfo) > 70 ? 'Low' : 
                     calculateInvestmentScore(propertyInfo) > 50 ? 'Medium' : 'High'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Features */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Property Analysis</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Investment potential scoring</li>
                <li>• Equity ratio calculation</li>
                <li>• Risk assessment</li>
                <li>• Market value analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Full Platform Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CSV data import and analysis</li>
                <li>• Portfolio management</li>
                <li>• Advanced filtering and search</li>
                <li>• Analytics dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoMode
