import React, { useState, useEffect } from 'react';
import { getCart } from './CartStorage';
import { useNavigate } from 'react-router-dom';

function OrderConfirm() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  return (
    <div className="container mt-5">
      <h2>Подтверждение заказа</h2>
      {cart.length === 0 ? (
        <div>
          <p>Ваша корзина пуста.</p>
          <img src="" alt="404" height={320} />
        </div>
      ) : (
        <div>
          <ul className="list-group">
            {cart.map(item => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                {item.title} - ${item.price.toFixed(2)}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <h4>Итоговая сумма: ${calculateTotal()}</h4>
          </div>
          <div className="mt-3">
            <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/cart')}>Назад в корзину</button>
            <button type="button" className="btn btn-success" onClick={() => navigate('/pay')}>Оплатить</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderConfirm;