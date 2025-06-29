import React from 'react';
import { Link } from 'react-router-dom';

function VendorCard({ vendor = {}, onClick, expanded = false }) {
  const {
    id = '',
    username = 'Unknown Vendor',
    email = 'N/A',
    address = 'N/A',
    distance = null,
    products = []
  } = vendor;

  return (
    <div
      className={`card shadow-sm mb-3 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width: expanded ? '100%' : '250px', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div className="card-body">
        <h5 className="card-title">
          <Link to={`/vendors/${id}`} className="text-decoration-none text-dark">
            {username}
          </Link>
        </h5>

        {expanded && (
          <>
            <p className="card-text mb-1"><strong>Email:</strong> {email}</p>
            <p className="card-text mb-1"><strong>Address:</strong> {address}</p>
            <p className="card-text mb-3">
              <strong>Distance:</strong>{' '}
              {distance !== null ? `${distance.toFixed(1)} km away` : 'Unknown'}
            </p>

            <h6>Products:</h6>
            {products.length === 0 ? (
              <p className="text-muted">No products listed.</p>
            ) : (
              <ul className="list-unstyled ps-3">
                {products.slice(0, 5).map(product => (
                  <li key={product.id}>
                    <Link to={`/products/${product.id}`} className="text-primary">
                      {product.name}
                    </Link>{' '}
                    - ${product.price}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VendorCard;
