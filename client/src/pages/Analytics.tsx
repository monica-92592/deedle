import React, { useState, useEffect } from 'react'
import { useProperties } from '../contexts/PropertyContext'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  Building2, 
  DollarSign, 
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'

interface AnalyticsData {
  stats: {
    totalProperties: number
    averageScore: number
    averageEquityRatio: number
    totalDelinquent: number
    totalPropertyValue: number
    averageDelinquencyAge: number
    scoreDistribution: {
      high: number
      medium: number
      low: number
    }
  }
  propertyTypes: Array<{
    property_type: string
    count: number
    avg_score: number
  }>
  scoreDistribution: Array<{
    score_range: string
    count: number
  }>
  equityDistribution: Array<{
    equity_range: string
    count: number
  }>
  topOpportunities: Array<{
    id: number
    parcel_id: string
    investment_score: number
    equity_ratio: number
    delinquent_amount: number
    property_type: string
    location: string
  }>
}

const Analytics: React.FC = () => {
  const { datasets, fetchProperties } = useProperties()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null)

  useEffect(() => {
    if (datasets.length > 0) {
      setSelectedDataset(datasets[0].id)
      fetchAnalytics(datasets[0].id)
    }
  }, [datasets])

  const fetchAnalytics = async (datasetId: number) => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/analysis/portfolio/${datasetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalyticsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleDatasetChange = (datasetId: number) => {
    setSelectedDataset(datasetId)
    fetchAnalytics(datasetId)
  }

  const COLORS = ['#047857', '#f59e0b', '#ef4444', '#3b82f6', '#10b981']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-12">
        <div className="text-error mb-4">{error || 'Failed to load analytics'}</div>
        <button
          onClick={() => selectedDataset && fetchAnalytics(selectedDataset)}
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
          <h1 className="text-3xl font-bold text-charcoal">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analysis of your property investment opportunities
          </p>
        </div>
        
        {datasets.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dataset</label>
            <select
              value={selectedDataset || ''}
              onChange={(e) => handleDatasetChange(Number(e.target.value))}
              className="input-field"
            >
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.filename} ({dataset.totalProperties} properties)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-charcoal">{analyticsData.stats.totalProperties}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-charcoal">{analyticsData.stats.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-accent/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-charcoal">${analyticsData.stats.totalPropertyValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-info/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Score Properties</p>
              <p className="text-2xl font-bold text-charcoal">{analyticsData.stats.scoreDistribution.high}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Investment Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score_range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#047857" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Property Types */}
        <div className="card">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Property Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.propertyTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ property_type, count }) => `${property_type}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData.propertyTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Equity Ratio Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Equity Ratio Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.equityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="equity_range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score vs Equity Ratio Scatter */}
        <div className="card">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Score vs Equity Ratio</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="equity_ratio" name="Equity Ratio" />
              <YAxis dataKey="investment_score" name="Investment Score" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter dataKey="investment_score" fill="#047857" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Opportunities */}
      <div className="card">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Top Investment Opportunities</h3>
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
              </tr>
            </thead>
            <tbody>
              {analyticsData.topOpportunities.map((property) => (
                <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{property.parcel_id}</td>
                  <td className="py-3 px-4">{property.location}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      property.investment_score >= 70 ? 'text-success' :
                      property.investment_score >= 50 ? 'text-warning' : 'text-error'
                    }`}>
                      {property.investment_score}
                    </span>
                  </td>
                  <td className="py-3 px-4">{property.equity_ratio.toFixed(2)}x</td>
                  <td className="py-3 px-4">${property.delinquent_amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {property.property_type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics
