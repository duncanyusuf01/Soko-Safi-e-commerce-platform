import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
    return (
        <div className="card h-100 shadow-sm border-0 rounded-4" style={{ width: '100%', maxWidth: '250px' }}>
            <img
                src={product.image_url}
                alt={product.name}
                className="card-img-top rounded-top-4"
                style={{ height: '150px', objectFit: 'cover' }}
            />
            <div className="card-body d-flex flex-column justify-content-between">
                <h5 className="card-title mb-2">
                    <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
                        {product.name}
                    </Link>
                </h5>
                <p className="card-text fw-bold text-primary mb-2">${product.price.toFixed(2)}</p>
                <p className="card-text small text-muted mb-0">
                    Sold by: <Link to={`/vendors/${product.vendor.id}`} className="text-decoration-none">{product.vendor.username}</Link>
                </p>
            </div>
        </div>
    );
}

export default ProductCard;
