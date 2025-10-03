import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'

interface UploadResult {
  success: boolean
  datasetId?: number
  totalProperties?: number
  validation?: any
  columnMapping?: any
  portfolioStats?: any
  message?: string
  error?: string
}

const Upload: React.FC = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload/csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          datasetId: result.datasetId,
          totalProperties: result.totalProperties,
          validation: result.validation,
          columnMapping: result.columnMapping,
          portfolioStats: result.portfolioStats,
          message: result.message
        })
      } else {
        setUploadResult({
          success: false,
          error: result.error || 'Upload failed'
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: 'Network error occurred during upload'
      })
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  const clearResult = () => {
    setUploadResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Upload Tax Data</h1>
        <p className="text-gray-600 mt-2">
          Upload CSV files from county tax offices to analyze investment opportunities
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
            isDragActive || dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium text-charcoal">Processing your file...</p>
              <p className="text-gray-600">This may take a few moments</p>
            </div>
          ) : (
            <div>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-charcoal mb-2">
                {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
              </p>
              <p className="text-gray-600 mb-4">or click to browse files</p>
              <button className="btn-primary">
                Choose File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className={`card ${uploadResult.success ? 'border-success' : 'border-error'}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {uploadResult.success ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <AlertCircle className="w-6 h-6 text-error" />
              )}
            </div>
            <div className="ml-4 flex-1">
              {uploadResult.success ? (
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Upload Successful!</h3>
                  <p className="text-gray-600 mb-4">{uploadResult.message}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">Properties Processed</p>
                      <p className="text-2xl font-bold text-charcoal">{uploadResult.totalProperties}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">Data Quality</p>
                      <p className="text-2xl font-bold text-charcoal">
                        {uploadResult.validation?.qualityScore?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">High Score Properties</p>
                      <p className="text-2xl font-bold text-charcoal">
                        {uploadResult.portfolioStats?.scoreDistribution?.high || 0}
                      </p>
                    </div>
                  </div>

                  {uploadResult.validation?.issues?.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Data Quality Issues Found:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {uploadResult.validation.issues.slice(0, 5).map((issue: string, index: number) => (
                          <li key={index}>• {issue}</li>
                        ))}
                        {uploadResult.validation.issues.length > 5 && (
                          <li>• ... and {uploadResult.validation.issues.length - 5} more issues</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <a
                      href="/properties"
                      className="btn-primary"
                    >
                      View Properties
                    </a>
                    <a
                      href="/analytics"
                      className="btn-outline"
                    >
                      View Analytics
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">Upload Failed</h3>
                  <p className="text-gray-600 mb-4">{uploadResult.error}</p>
                  <button
                    onClick={clearResult}
                    className="btn-outline"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={clearResult}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-charcoal mb-4">How to Upload Tax Data</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
              1
            </div>
            <div>
              <h4 className="font-medium text-charcoal">Download CSV from County Website</h4>
              <p className="text-gray-600">Visit your county's tax collector website and download the tax delinquency data in CSV format.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
              2
            </div>
            <div>
              <h4 className="font-medium text-charcoal">Upload the File</h4>
              <p className="text-gray-600">Drag and drop your CSV file into the upload area above, or click to browse and select the file.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
              3
            </div>
            <div>
              <h4 className="font-medium text-charcoal">Review Analysis</h4>
              <p className="text-gray-600">Our intelligent parser will automatically detect column types and analyze each property for investment potential.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Supported Data Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-charcoal mb-2">Required Columns (Auto-Detected)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Parcel ID</li>
              <li>• Power to Sale Date</li>
              <li>• Delinquent Amount</li>
              <li>• Property Description</li>
              <li>• Address</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-charcoal mb-2">Optional Columns</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Land Value</li>
              <li>• Improvement Value</li>
              <li>• Tax Area</li>
              <li>• Location</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upload
