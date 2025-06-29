import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

function HomePage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/products');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                    setFilteredProducts(data);

                    // Extract unique categories
                    const uniqueCategories = ['All', ...new Set(data.map(p => p.category || 'Uncategorized'))];
                    setCategories(uniqueCategories);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        // Filter based on category and search term
        let filtered = [...products];

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => (p.category || 'Uncategorized') === selectedCategory);
        }

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    }, [searchTerm, selectedCategory, products]);

    if (loading) return (
        <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Loading products...</p>
        </div>
    );

    return (
        <div className="container py-4">
            {/* Hero Section */}
            <div className="bg-primary text-white p-5 rounded shadow-sm mb-4">
                <h1 className="display-5">Welcome to Soko Safi!</h1>
                <p className="lead mb-0">Browse a wide range of potraits from nearby vendors.</p>
            </div>

            {/* Filters */}
            <div className="row align-items-center mb-4">
                <div className="col-md-4 mb-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-4 mb-2">
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map((category, i) => (
                            <option key={i} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4 text-md-end">
                    <span className="text-muted">{filteredProducts.length} product(s) found</span>
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
                <div className="alert alert-warning">No products match your search.</div>
            ) : (
                <div className="row g-4">
                    {filteredProducts.map(product => (
                        <div className="col-sm-6 col-md-4 col-lg-3" key={product.id}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HomePage;
