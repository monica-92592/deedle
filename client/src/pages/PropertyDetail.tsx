import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Bookmark, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Building2,
  Landmark,
  FileText
} from 'lucide-react'

interface Property {
  id: number
  parcelId: string
  powerToSaleDate: string
  taxArea: string
  location: string
  delinquentAmount: number
  landValue: number
  improvementValue: number
  propertyDescription: string
  address: string
  propertyType: string
  acreage: number
  equityRatio: number
  delinquencyAge: number
  investmentScore: number
  estimatedRedemption: number
  datasetName: string
  uploadDate: string
  isWatchlisted: boolean
  watchlistNotes: string
  watchlistPriority: string
  totalPropertyValue: number
  potentialProfit: number
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [watchlistNotes, setWatchlistNotes] = useState('')
  const [watchlistPriority, setWatchlistPriority] = useState('medium')
  const [isWatchlisted, setIsWatchlisted] = useState(false)

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/properties/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch property')
      }

      const data = await response.json()
      setProperty(data)
      setIsWatchlisted(data.is_watchlisted)
      setWatchlistNotes(data.watchlist_notes || '')
      setWatchlistPriority(data.watchlist_priority || 'medium')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch property')
    } finally {
      setLoading(false)
    }
  }

  const toggleWatchlist = async () => {
    if (!property) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/properties/${property.id}/watchlist`, {
        method: isWatchlisted ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: watchlistNotes,
          priority: watchlistPriority
        })
      })

      if (response.ok) {
        setIsWatchlisted(!isWatchlisted)
      }
    } catch (err) {
      console.error('Failed to update watchlist:', err)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-error'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="w-5 h-5" />
    if (score >= 50) return <AlertTriangle className="w-5 h-5" />
    return <AlertTriangle className="w-5 h-5" />
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Low Risk', color: 'text-success' }
    if (score >= 60) return { level: 'Medium Risk', color: 'text-warning' }
    return { level: 'High Risk', color: 'text-error' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="text-center py-12">
        <div className="text-error mb-4">{error || 'Property not found'}</div>
        <Link to="/properties" className="btn-primary">
          Back to Properties
        </Link>
      </div>
    )
  }

  const riskInfo = getRiskLevel(property.investmentScore)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/properties" className="text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Property Details</h1>
            <p className="text-gray-600 mt-1">Parcel ID: {property.parcelId}</p>
          </div>
        </div>
        <button
          onClick={toggleWatchlist}
          className={`flex items-center px-4 py-2 rounded-lg font-medium ${
            isWatchlisted 
              ? 'bg-accent text-white hover:bg-accent-dark' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Bookmark className="w-4 h-4 mr-2" />
          {isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Property Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Investment Score Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-charcoal">Investment Analysis</h2>
              <div className="flex items-center">
                {getScoreIcon(property.investmentScore)}
                <span className={`ml-2 text-2xl font-bold ${getScoreColor(property.investmentScore)}`}>
                  {property.investmentScore}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <p className={`font-semibold ${riskInfo.color}`}>{riskInfo.level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Equity Ratio</p>
                <p className="font-semibold">{property.equityRatio.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delinquency Age</p>
                <p className="font-semibold">{property.delinquencyAge} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Property Type</p>
                <p className="font-semibold capitalize">{property.propertyType || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Financial Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Delinquent Amount</span>
                <span className="font-semibold">${property.delinquentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Land Value</span>
                <span className="font-semibold">${property.landValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Improvement Value</span>
                <span className="font-semibold">${property.improvementValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Property Value</span>
                <span className="font-semibold">${property.totalPropertyValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Estimated Redemption</span>
                <span className="font-semibold">${property.estimatedRedemption.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Potential Profit</span>
                <span className={`font-semibold ${property.potentialProfit >= 0 ? 'text-success' : 'text-error'}`}>
                  ${property.potentialProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Property Description */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Property Description</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{property.propertyDescription}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Property Details</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">{property.location}</p>
                  {property.address && (
                    <p className="text-sm text-gray-600">{property.address}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Power to Sale Date</p>
                  <p className="text-sm text-gray-600">
                    {property.powerToSaleDate 
                      ? new Date(property.powerToSaleDate).toLocaleDateString()
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Landmark className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Tax Area</p>
                  <p className="text-sm text-gray-600">{property.taxArea || 'Not specified'}</p>
                </div>
              </div>
              
              {property.acreage && (
                <div className="flex items-start">
                  <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Acreage</p>
                    <p className="text-sm text-gray-600">{property.acreage} acres</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Watchlist Notes */}
          {isWatchlisted && (
            <div className="card">
              <h3 className="text-lg font-semibold text-charcoal mb-4">Watchlist Notes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={watchlistNotes}
                    onChange={(e) => setWatchlistNotes(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Add your research notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={watchlistPriority}
                    onChange={(e) => setWatchlistPriority(e.target.value)}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <button
                  onClick={toggleWatchlist}
                  className="w-full btn-primary"
                >
                  Update Watchlist
                </button>
              </div>
            </div>
          )}

          {/* Dataset Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Dataset Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Dataset</p>
                <p className="font-medium">{property.datasetName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Upload Date</p>
                <p className="font-medium">
                  {new Date(property.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetail
