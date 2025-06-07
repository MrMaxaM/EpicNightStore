import React, { useState, useEffect } from 'react';
import { getCart, removeFromCart } from './CartStorage';
import { useNavigate } from 'react-router-dom';

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
    setCart(getCart());
  };

  return (
    <div className="container mt-5">
      <h2>Корзина</h2>
      {cart.length === 0 ? (
        <div>
          <p>Ваша корзина пуста.</p>
          <img src="https://localhost:7099/file/img/knight_404.jfif" alt="404" height={320}/>
        </div>
      ) : (
        <div>
          <ul className="list-group">
            {cart.map(item => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <img src={item.imageURL} alt={item.title} className="game-cover me-3" />
                        <strong>{item.title}</strong> {item.developer} | {item.publisher}
                <button className="btn btn-danger" onClick={() => handleRemoveFromCart(item.gameId)}>Удалить</button>
              </li>
            ))}
          </ul>
          <button type="button" class="btn btn-success" onClick={() => navigate('/orderconfirm')}>Оформить заказ</button>
        </div>
      )}
    </div>
  );
}

export default CartPage;