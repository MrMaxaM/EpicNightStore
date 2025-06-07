import React, { useState, useEffect } from 'react';
import { getCart, addToCart, removeFromCart } from './CartStorage';
import { format, parseISO } from 'date-fns';

function ProductCard({ product }) {
  const [isInCart, setInCart] = useState(false);

  useEffect(() => {
    const cart = getCart();
    setInCart(cart.some(item => item.gameId === product.gameId));
  }, [product.gameId]);

  const toggleCart = () => {
    if (isInCart) {
      removeFromCart(product.gameId);
    } else {
      addToCart(product);
    }
    setInCart(!isInCart);
  };

  return (
    <div className="card mb-3">
      <img src={product.imageURL} style={{ height: "30vh", objectFit: "cover", objectPosition: "top" }} className="card-img-top" alt={product.name} />
      <div className="Product-card card-body">
        <h5 className="Product-card card-text">{product.title}</h5>
        <hr class="my-0"/>
        <p className="Product-card card-text">{product.description}</p>
        <hr class="my-1"/>
        {product.developer == product.publisher ? (
          <p className="Product-card card-subtext">{product.developer} | {format(parseISO(product.releaseDate), 'dd MMM yyyy')}</p>
        ) : (
          <p className="Product-card card-subtext">{product.developer} | {product.publisher} | {format(parseISO(product.releaseDate), 'dd MMM yyyy')}</p>
        )}
        {isInCart ? (
          <button className="btn btn-secondary" onClick={toggleCart}>🛒В корзине</button>
        ) : (
          <button className="btn btn-primary" onClick={toggleCart}>${product.price} В корзину</button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;