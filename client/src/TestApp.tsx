import React from 'react'

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏠 Deedle Test App</h1>
      <p>If you can see this, React is working!</p>
      <p>Current URL: {window.location.href}</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  )
}

export default TestApp
