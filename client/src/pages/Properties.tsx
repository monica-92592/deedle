import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProperties } from '../contexts/PropertyContext'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Bookmark,
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react'

const Properties: React.FC = () => {
  const { properties, datasets, loading, error, fetchProperties, setCurrentDataset } = useProperties()
  const [filters, setFilters] = useState({
    search: '',
    minScore: '',
    maxScore: '',
    minEquityRatio: '',
    maxEquityRatio: '',
    minAmount: '',
    maxAmount: '',
    propertyType: '',
    location: '',
    sortBy: 'investment_score',
    sortOrder: 'DESC'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProperties, setSelectedProperties] = useState<number[]>([])

  useEffect(() => {
    if (datasets.length > 0) {
      fetchProperties(datasets[0].id, filters)
    }
  }, [datasets, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      minScore: '',
      maxScore: '',
      minEquityRatio: '',
      maxEquityRatio: '',
      minAmount: '',
      maxAmount: '',
      propertyType: '',
      location: '',
      sortBy: 'investment_score',
      sortOrder: 'DESC'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-error'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-4 h-4" />
    if (score >= 50) return <TrendingDown className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  const exportToCSV = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/properties/export/csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'properties_export.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const filteredProperties = properties.filter(property => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        property.parcelId.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.address.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Properties</h1>
          <p className="text-gray-600 mt-2">
            Browse and analyze tax-delinquent properties for investment opportunities
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="btn-outline flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-primary flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Parcel ID, location, address..."
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
              <input
                type="number"
                value={filters.minScore}
                onChange={(e) => handleFilterChange('minScore', e.target.value)}
                placeholder="0"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input
                type="number"
                value={filters.maxScore}
                onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                placeholder="100"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Equity Ratio</label>
              <input
                type="number"
                value={filters.minEquityRatio}
                onChange={(e) => handleFilterChange('minEquityRatio', e.target.value)}
                placeholder="0"
                step="0.1"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Equity Ratio</label>
              <input
                type="number"
                value={filters.maxEquityRatio}
                onChange={(e) => handleFilterChange('maxEquityRatio', e.target.value)}
                placeholder="10"
                step="0.1"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                placeholder="0"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                placeholder="1000000"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="raw_land">Raw Land</option>
                <option value="multi_family">Multi-Family</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="City, area..."
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="input-field"
              >
                <option value="investment_score">Investment Score</option>
                <option value="equity_ratio">Equity Ratio</option>
                <option value="delinquent_amount">Delinquent Amount</option>
                <option value="delinquency_age">Delinquency Age</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="input-field"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={clearFilters}
              className="btn-outline"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="btn-primary"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-error mb-4">{error}</div>
            <button
              onClick={() => fetchProperties()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-6">
              {properties.length === 0 
                ? "Upload your first dataset to start analyzing properties"
                : "Try adjusting your filters to see more results"
              }
            </p>
            {properties.length === 0 && (
              <Link to="/upload" className="btn-primary">
                Upload Data
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Parcel ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Equity Ratio</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm">{property.parcelId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">{property.location}</div>
                          {property.address && (
                            <div className="text-sm text-gray-600">{property.address}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getScoreIcon(property.investmentScore)}
                        <span className={`ml-2 font-semibold ${getScoreColor(property.investmentScore)}`}>
                          {property.investmentScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{property.equityRatio.toFixed(2)}x</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="font-semibold">${property.delinquentAmount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {property.propertyType || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link
                          to={`/properties/${property.id}`}
                          className="text-primary hover:text-primary-dark"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="text-gray-400 hover:text-accent">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Properties
