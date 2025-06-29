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
        let coords = { lat: -1.2921, lng: 36.8219 };

        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject)
          );
          coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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

  if (loading) return <div className="text-center my-5"><div className="spinner-border" role="status" /></div>;

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3 text-primary">Vendors Near You</h1>

      <div className="alert alert-info">
        <p className="mb-1">
          <strong>Your location:</strong>{' '}
          {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Unknown'}
        </p>
        {vendors.length > 0 && (
          <p className="mb-0">
            <strong>{vendors.length} vendor(s)</strong> within a 10 km radius
          </p>
        )}
      </div>

      <div className="row">
        {/* Left: List of vendors */}
        <div className="col-md-5 mb-4">
          <h4 className="text-secondary mb-3">Nearby Vendors</h4>
          <div className="border rounded shadow-sm p-2 bg-white" style={{ maxHeight: '520px', overflowY: 'auto' }}>
            {vendors.length > 0 ? (
              <ul className="list-group list-group-flush">
                {vendors
                  .sort((a, b) => a.distance - b.distance)
                  .map((vendor) => (
                    <li
                      key={vendor.id}
                      className={`list-group-item list-group-item-action ${selectedVendor?.id === vendor.id ? 'active' : ''
                        }`}
                      role="button"
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <strong>{vendor.username}</strong>
                        <span className="badge bg-primary">{vendor.distance.toFixed(1)} km</span>
                      </div>
                      <p className="mb-1 text-muted small">{vendor.address}</p>
                      <small className="text-secondary">
                        {vendor.products?.length || 0} product(s)
                      </small>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="text-muted text-center py-3">No vendors found in your area.</div>
            )}
          </div>
        </div>

        {/* Right: Selected vendor details */}
        <div className="col-md-7 mb-4">
          <h4 className="text-secondary mb-3">Vendor Details</h4>
          {selectedVendor ? (
            <div className="bg-light border rounded shadow-sm p-3">
              <VendorCard vendor={selectedVendor} expanded />
            </div>
          ) : (
            <div className="border border-2 border-dashed p-5 text-center text-muted rounded">
              <p>Select a vendor from the list to view more details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NearbyPage;