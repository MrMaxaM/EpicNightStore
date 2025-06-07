import React from 'react';
import ProductCard from './ProductCard';

function ProductList({ products }) {
  return (
    <div className="container mt-4 Product-list">
      <div className="row">
        {products.map((product) => (
          <div className="col-md-4" key={product.gameId}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;