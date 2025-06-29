// client/src/components/VendorCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function VendorCard({ vendor, onClick, expanded = false }) {
  const cardStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    cursor: onClick ? 'pointer' : 'default',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    margin: '10px',
    width: expanded ? '100%' : '250px'
  };

  return (
    <div style={cardStyle} onClick={onClick}>
      <h3>
        <Link to={`/vendors/${vendor.id}`}>{vendor.username}</Link>
      </h3>
      {expanded && (
        <>
          <p>Email: {vendor.email}</p>
          <p>Address: {vendor.address}</p>
          <p>Distance: {vendor.distance ? `${vendor.distance.toFixed(1)} km away` : 'Unknown'}</p>
          <h4>Products:</h4>
          <ul>
            {(vendor.products || []).slice(0, 5).map(product => (
              <li key={product.id}>
                <Link to={`/products/${product.id}`}>{product.name}</Link> - ${product.price}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default VendorCard;