import React, { createContext, useContext, useState, ReactNode } from 'react'
import { API_URL, DEMO_MODE } from '../config/api'
import { DEMO_PROPERTIES, DEMO_DATASETS } from '../services/demoData'

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
  datasetId: number
  datasetName: string
  uploadDate: string
}

interface Dataset {
  id: number
  filename: string
  uploadDate: string
  totalProperties: number
  processedProperties: number
  status: string
}

interface PropertyContextType {
  properties: Property[]
  datasets: Dataset[]
  currentDataset: Dataset | null
  loading: boolean
  error: string | null
  fetchDatasets: () => Promise<void>
  fetchProperties: (datasetId?: number, filters?: PropertyFilters) => Promise<void>
  setCurrentDataset: (dataset: Dataset | null) => void
  clearError: () => void
}

interface PropertyFilters {
  minScore?: number
  maxScore?: number
  minEquityRatio?: number
  maxEquityRatio?: number
  minAmount?: number
  maxAmount?: number
  propertyType?: string
  location?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  limit?: number
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

export const useProperties = () => {
  const context = useContext(PropertyContext)
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider')
  }
  return context
}

interface PropertyProviderProps {
  children: ReactNode
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([])
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDatasets = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (DEMO_MODE) {
        // Use demo data when backend is not available
        setDatasets(DEMO_DATASETS)
        setLoading(false)
        return
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/upload/datasets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch datasets')
      }

      const data = await response.json()
      setDatasets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch datasets')
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async (datasetId?: number, filters?: PropertyFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      if (DEMO_MODE) {
        // Use demo data when backend is not available
        setProperties(DEMO_PROPERTIES)
        setLoading(false)
        return
      }

      const token = localStorage.getItem('token')
      const queryParams = new URLSearchParams()
      
      if (datasetId) queryParams.append('datasetId', datasetId.toString())
      if (filters?.minScore !== undefined) queryParams.append('minScore', filters.minScore.toString())
      if (filters?.maxScore !== undefined) queryParams.append('maxScore', filters.maxScore.toString())
      if (filters?.minEquityRatio !== undefined) queryParams.append('minEquityRatio', filters.minEquityRatio.toString())
      if (filters?.maxEquityRatio !== undefined) queryParams.append('maxEquityRatio', filters.maxEquityRatio.toString())
      if (filters?.minAmount !== undefined) queryParams.append('minAmount', filters.minAmount.toString())
      if (filters?.maxAmount !== undefined) queryParams.append('maxAmount', filters.maxAmount.toString())
      if (filters?.propertyType) queryParams.append('propertyType', filters.propertyType)
      if (filters?.location) queryParams.append('location', filters.location)
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder)
      if (filters?.page) queryParams.append('page', filters.page.toString())
      if (filters?.limit) queryParams.append('limit', filters.limit.toString())

      const response = await fetch(`${API_URL}/api/properties?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }

      const data = await response.json()
      setProperties(data.properties)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    properties,
    datasets,
    currentDataset,
    loading,
    error,
    fetchDatasets,
    fetchProperties,
    setCurrentDataset,
    clearError
  }

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  )
}
