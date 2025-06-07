import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { getCart } from './CartStorage';
import { useNavigate } from 'react-router-dom';
  
function GreetingsPage() {
    return (
    <main class="container">
        <section class="welcome-block d-flex align-items-center mb-5">
        <div class="welcome-image">
            <img src="https://localhost:7099/file/img/knight_default.jfif" alt="Welcome Image" class="img-fluid"/>
        </div>
        <div class="welcome-text ms-4">
            <h2>Добро пожаловать в Epic Knight Store!</h2>
            <p>Откройте для себя мир захватывающих приключений и эпических сражений. У нас вы найдете лучшие игры для настоящих героев и приключенцев. Присоединяйтесь к нам и начните свое приключение уже сегодня!</p>
        </div>
        </section>
    </main>
    );
}

export default GreetingsPage