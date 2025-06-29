// client/src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/products');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <p>Loading products...</p>;

    return (
        <div>
            <h1>All Products</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default HomePage;