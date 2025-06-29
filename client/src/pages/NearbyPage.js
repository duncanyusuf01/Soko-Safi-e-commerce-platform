// client/src/pages/NearbyPage.js
import React, { useState, useEffect } from 'react';
import VendorCard from '../components/VendorCard';

function NearbyPage() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationAndVendors = async () => {
      try {
        let coords = { lat: -1.2921, lng: 36.8219 }; // Default to Nairobi
        
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        }
        
        setLocation(coords);
        await fetchNearbyVendors(coords.lat, coords.lng);
      } catch (err) {
        console.error("Error getting location:", err);
        setError("Could not determine your location. Showing vendors near Nairobi.");
        await fetchNearbyVendors(-1.2921, 36.8219);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndVendors();
  }, []);

  const fetchNearbyVendors = async (lat, lng) => {
    try {
      const response = await fetch(`/vendors/nearby?lat=${lat}&lng=${lng}&radius=10`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError("Failed to load nearby vendors. Please try again later.");
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading vendors near you...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Vendors Near You</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <p>
          <strong>Your location:</strong> {location ? 
            `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 
            'Unknown'}
        </p>
        {vendors.length > 0 && (
          <p>
            <strong>Showing {vendors.length} vendors within 10km radius</strong>
          </p>
        )}
      </div>
      
      {selectedVendor && (
        <div style={{ 
          marginBottom: '40px', 
          padding: '20px', 
          border: '1px solid #eee', 
          borderRadius: '8px'
        }}>
          <h2>Selected Vendor: {selectedVendor.username}</h2>
          <VendorCard vendor={selectedVendor} />
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '300px' }}>
          <h2>Vendors by Distance</h2>
          <div style={{ 
            maxHeight: '500px', 
            overflowY: 'auto', 
            border: '1px solid #eee', 
            borderRadius: '8px',
            padding: '10px'
          }}>
            {vendors.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {vendors
                  .sort((a, b) => a.distance - b.distance)
                  .map(vendor => (
                    <li 
                      key={vendor.id} 
                      style={{ 
                        margin: '10px 0', 
                        padding: '10px',
                        backgroundColor: selectedVendor?.id === vendor.id ? '#f0f0f0' : 'white',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{vendor.username}</strong>
                        <span>{vendor.distance.toFixed(1)} km</span>
                      </div>
                      <p style={{ margin: '5px 0', color: '#666' }}>{vendor.address}</p>
                      <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                        {vendor.products?.length || 0} products available
                      </p>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No vendors found in your area.</p>
            )}
          </div>
        </div>
        
        <div style={{ flex: 3, minWidth: '300px' }}>
          <h2>Vendor Details</h2>
          {selectedVendor ? (
            <VendorCard vendor={selectedVendor} expanded />
          ) : (
            <div style={{ 
              padding: '20px', 
              border: '1px dashed #ccc', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p>Select a vendor to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NearbyPage;