import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, setCart } from './CartStorage';

function CheckoutPage() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cardNumber || !expiryDate || !cvv) {
      alert('All payment fields must be filled.');
      return;
    }

    try {
      const cart = getCart();
      const gameIds = cart.map(item => item.gameId);
      const token = localStorage.getItem('token');

      const orderResponse = await fetch('https://localhost:7099/CreateOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ gameIds })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderId = await orderResponse.json();

      const confirmResponse = await fetch(`https://localhost:7099/ConfirmOrder/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm order');
      }

      // Очистка корзины после успешного заказа
      setCart([]);
      navigate('/success');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Error confirming order. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Оформление заказа</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="cardNumber" className="form-label">Номер карты</label>
          <input
            type="text"
            className="form-control"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="expiryDate" className="form-label">Срок действия</label>
          <input
            type="text"
            className="form-control"
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cvv" className="form-label">CVV</label>
          <input
            type="text"
            className="form-control"
            id="cvv"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Подтвердить оплату</button>
      </form>
    </div>
  );
}

export default CheckoutPage;