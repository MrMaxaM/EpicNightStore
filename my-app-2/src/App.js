import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header'; //Подключаем хедер
import ProductList from './components/ProductList'; //Подключаеме список продуктов
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import ListOfUsers from './components/ListOfUsers';
import ProfilePage from './components/ProfilePage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import SuccessPage from './components/SuccessPage';
import Greetings from './components/Greetings';
import OrderConfirm from './components/OrderConfirm';
import AboutUs from './components/AboutUs';

function App() {
  const [products, setProducts] = useState([]); //Используем useState для установки состояния списка продуктов

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://localhost:7099/GetAllGames'); // Fetch для генерации html-запроса
      const json = await response.json(); //Получаем json из запроса
      setProducts(json); // Устанавливаем список
    };

    fetchData();
  }, []);
  
  return (
    <Router>
      <div className="App">
      <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" 
              element={
                <PrivateRoute>
                  <Greetings />
                  <ProductList products={products} /> 
                </PrivateRoute>
              }/>
            <Route path="/users"
              element={
                <PrivateRoute>
                    <ListOfUsers />
                </PrivateRoute>
              }/>
            <Route path="/profile"
              element={
                <PrivateRoute>
                    <ProfilePage />
                </PrivateRoute>
              }/>
            <Route path="/cart" element={<CartPage/>}/>
            <Route path="/pay" element={<CheckoutPage/>} />
            <Route path="/orderconfirm" element={<OrderConfirm/>} />
            <Route path="/success" element={<SuccessPage/>} />
            <Route path="/aboutus" element={<AboutUs/>} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;