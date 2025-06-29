// client/src/components/ProductCard.js

import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
    const cardStyle = {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        width: '250px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const imageStyle = {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '4px'
    };
    
    return (
        <div style={cardStyle}>
            <img src={product.image_url} alt={product.name} style={imageStyle} />
            <h3>
                <Link to={`/products/${product.id}`}>{product.name}</Link>
            </h3>
            <p>${product.price.toFixed(2)}</p>
            <p>
                Sold by: <Link to={`/vendors/${product.vendor.id}`}>{product.vendor.username}</Link>
            </p>
        </div>
    );
}

export default ProductCard;