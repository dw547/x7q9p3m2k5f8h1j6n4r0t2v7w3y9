import React, { useState, useEffect } from 'react';

const ApiResponseCard = () => {
  const [showCard, setShowCard] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URI}/cpu-usage`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setApiData(data);
      setShowCard(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showCard) {
      fetchData();
    }
  }, [showCard]);

  return (
    <div style={{ padding: '1rem' }}>
      <button 
        onClick={() => setShowCard(!showCard)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {showCard ? 'Hide' : 'Show'} Server Details
      </button>
      
      {showCard && (
        <div style={{
          marginTop: '1rem',
          maxWidth: '500px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid #ddd'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Server Details</h3>
            <button 
              onClick={() => setShowCard(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: '1rem' }}>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {apiData && (
              <>
                <p><strong>CPU Usage:</strong> {apiData.cpu}%</p>
                <p><strong>Memory Usage:</strong> {apiData.mem}%</p>
                <p><strong>Status:</strong> {apiData.status}</p>
                <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Server Information:</h4>
                <p><strong>Name:</strong> {apiData.server.server_name}</p>
                <p><strong>IP:</strong> {apiData.server.server_ip}</p>
                <p><strong>Port:</strong> {apiData.server.server_port}</p>
                <p><strong>VM ID:</strong> {apiData.server.gc_vm_id}</p>
                <p><strong>VM Status:</strong> {apiData.server.gc_vm_status}</p>
                <p><strong>Created At:</strong> {new Date(apiData.server.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(apiData.server.updatedAt).toLocaleString()}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiResponseCard;