import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { getCart } from './CartStorage';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Header() {
  const token = localStorage.getItem('token');

  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  
    useEffect(() => {
    const updateCart = () => {
      setCart(getCart());
    };

    updateCart();

    // Подписываемся на событие storage, чтобы обновлять корзину при изменениях в localStorage
    window.addEventListener('storage', updateCart);

    return () => {
      window.removeEventListener('storage', updateCart);
    };
  }, []);
  return (
    <header class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between mb-4 border-bottom back App-header">
      <div class="nav col-2 d-flex align-items-center col-md-4">
        <div class="col-md-6 mb-2 mb-md-0">
          <a href="/" class=" link-body-emphasis text-decoration-none">
            <img src="https://localhost:7099/file/img/knight_logo.webp" alt="Icon" height={120}/>
          </a>
        </div>
        <div class="ms-14">
          <h1 class="h4 mb-0">Epic Knight Store</h1>
        </div>
      </div>

      <ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
        <li><a href="/" class="nav-link px-2">Главная</a></li>
        <li><a href="/aboutus" class="nav-link px-2">О нас</a></li>
      </ul>

      <div class="col-md-4 text-end">
        {localStorage.getItem('Role') == 'Admin' && (
          <button type="button" class="btn btn-warning" onClick={() => navigate('/users')}>Админ</button>
        )}
        <button type="button" class="btn btn-light" onClick={() => navigate('/cart')}>Корзина ({cart.length})</button>
        <button type="button" class="btn btn-light" onClick={() => navigate('/profile')}>Личный кабинет</button>
      </div>
    </header>
  );
}

export default Header;