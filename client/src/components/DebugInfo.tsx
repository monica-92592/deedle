import React from 'react'

const DebugInfo: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50">
      <div>Hostname: {window.location.hostname}</div>
      <div>Path: {window.location.pathname}</div>
      <div>Hash: {window.location.hash}</div>
    </div>
  )
}

export default DebugInfo
