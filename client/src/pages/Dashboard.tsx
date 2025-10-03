import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProperties } from '../contexts/PropertyContext'
import { 
  Upload, 
  Building2, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Calendar,
  BarChart3,
  Bookmark
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const { datasets, properties, fetchDatasets, fetchProperties } = useProperties()
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalDatasets: 0,
    highScoreProperties: 0,
    totalValue: 0
  })

  useEffect(() => {
    fetchDatasets()
  }, [])

  useEffect(() => {
    if (datasets.length > 0) {
      fetchProperties(datasets[0].id)
    }
  }, [datasets])

  useEffect(() => {
    if (properties.length > 0) {
      const highScore = properties.filter(p => p.investmentScore >= 70).length
      const totalValue = properties.reduce((sum, p) => sum + (p.landValue + p.improvementValue), 0)
      
      setStats({
        totalProperties: properties.length,
        totalDatasets: datasets.length,
        highScoreProperties: highScore,
        totalValue
      })
    }
  }, [properties, datasets])

  const quickActions = [
    {
      title: 'Upload New Data',
      description: 'Import CSV files from county tax offices',
      icon: Upload,
      href: '/upload',
      color: 'bg-primary'
    },
    {
      title: 'View Properties',
      description: 'Browse and filter analyzed properties',
      icon: Building2,
      href: '/properties',
      color: 'bg-accent'
    },
    {
      title: 'Analytics',
      description: 'View detailed portfolio analytics',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-success'
    },
    {
      title: 'Watchlist',
      description: 'Manage your saved properties',
      icon: Bookmark,
      href: '/watchlist',
      color: 'bg-info'
    }
  ]

  const topProperties = properties
    .sort((a, b) => b.investmentScore - a.investmentScore)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Deedle</h1>
        <p className="text-primary-100 text-lg">
          Your comprehensive platform for analyzing tax-delinquent property investment opportunities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-charcoal">{stats.totalProperties.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Score Properties</p>
              <p className="text-2xl font-bold text-charcoal">{stats.highScoreProperties.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-accent/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Property Value</p>
              <p className="text-2xl font-bold text-charcoal">${stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-info/10 rounded-lg">
              <Calendar className="w-6 h-6 text-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Datasets</p>
              <p className="text-2xl font-bold text-charcoal">{stats.totalDatasets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-charcoal mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">{action.title}</h3>
              <p className="text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Properties */}
      {topProperties.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-charcoal">Top Investment Opportunities</h2>
            <Link to="/properties" className="text-primary hover:text-primary-dark font-medium">
              View all →
            </Link>
          </div>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Parcel ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Investment Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Equity Ratio</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {topProperties.map((property) => (
                    <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{property.parcelId}</td>
                      <td className="py-3 px-4">{property.location}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${
                          property.investmentScore >= 70 ? 'score-high' :
                          property.investmentScore >= 50 ? 'score-medium' : 'score-low'
                        }`}>
                          {property.investmentScore}
                        </span>
                      </td>
                      <td className="py-3 px-4">{property.equityRatio.toFixed(2)}x</td>
                      <td className="py-3 px-4">${property.delinquentAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started */}
      {datasets.length === 0 && (
        <div className="card bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20">
          <div className="text-center py-8">
            <Upload className="w-16 h-16 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-charcoal mb-2">Get Started with Deedle</h3>
            <p className="text-gray-600 mb-6">
              Upload your first CSV file from a county tax office to start analyzing investment opportunities
            </p>
            <Link to="/upload" className="btn-primary">
              Upload Your First Dataset
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
