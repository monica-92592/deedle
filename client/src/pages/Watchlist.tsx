import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bookmark, 
  Eye, 
  Trash2, 
  Edit3, 
  Check,
  X,
  Building2,
  MapPin,
  DollarSign,
  TrendingUp
} from 'lucide-react'

interface WatchlistProperty {
  id: number
  parcelId: string
  location: string
  address: string
  investmentScore: number
  equityRatio: number
  delinquentAmount: number
  propertyType: string
  watchlistNotes: string
  watchlistPriority: string
  watchlistDate: string
  datasetName: string
}

const Watchlist: React.FC = () => {
  const [properties, setProperties] = useState<WatchlistProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProperty, setEditingProperty] = useState<number | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editPriority, setEditPriority] = useState('medium')

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/properties/watchlist/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch watchlist')
      }

      const data = await response.json()
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch watchlist')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (propertyId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/properties/${propertyId}/watchlist`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setProperties(properties.filter(p => p.id !== propertyId))
      }
    } catch (err) {
      console.error('Failed to remove from watchlist:', err)
    }
  }

  const updateWatchlist = async (propertyId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/properties/${propertyId}/watchlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: editNotes,
          priority: editPriority
        })
      })

      if (response.ok) {
        setProperties(properties.map(p => 
          p.id === propertyId 
            ? { ...p, watchlistNotes: editNotes, watchlistPriority: editPriority }
            : p
        ))
        setEditingProperty(null)
      }
    } catch (err) {
      console.error('Failed to update watchlist:', err)
    }
  }

  const startEditing = (property: WatchlistProperty) => {
    setEditingProperty(property.id)
    setEditNotes(property.watchlistNotes)
    setEditPriority(property.watchlistPriority)
  }

  const cancelEditing = () => {
    setEditingProperty(null)
    setEditNotes('')
    setEditPriority('medium')
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-error'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading watchlist...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error mb-4">{error}</div>
        <button
          onClick={fetchWatchlist}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Watchlist</h1>
          <p className="text-gray-600 mt-2">
            Manage your saved properties and research notes
          </p>
        </div>
        <div className="text-sm text-gray-600">
          {properties.length} properties saved
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-charcoal mb-2">No Properties in Watchlist</h3>
          <p className="text-gray-600 mb-6">
            Start building your watchlist by saving interesting properties from your analysis
          </p>
          <Link to="/properties" className="btn-primary">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-charcoal">{property.parcelId}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(property.watchlistPriority)}`}>
                        {property.watchlistPriority} priority
                      </span>
                      <span className={`font-semibold ${getScoreColor(property.investmentScore)}`}>
                        Score: {property.investmentScore}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/properties/${property.id}`}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => startEditing(property)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromWatchlist(property.id)}
                        className="text-gray-400 hover:text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{property.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 capitalize">{property.propertyType}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">${property.delinquentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{property.equityRatio.toFixed(2)}x equity</span>
                    </div>
                  </div>

                  {editingProperty === property.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={3}
                          className="input-field"
                          placeholder="Add your research notes..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className="input-field"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateWatchlist(property.id)}
                          className="btn-primary flex items-center"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="btn-outline flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {property.watchlistNotes && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{property.watchlistNotes}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Added on {new Date(property.watchlistDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Watchlist
