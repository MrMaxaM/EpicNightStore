import { useNavigate } from 'react-router-dom';
import { setCart } from './CartStorage';
import React, { useEffect, useState } from 'react';

const ProfilePage = () => {
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setCart([]);
        navigate('/login'); // Перенаправляем на страницу логина
    };

    useEffect(() => {
        const fetchGames = async () => {
        try {
            const response = await fetch('https://localhost:7099/GetUserGames', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Добавляем токен аутентификации
                },
                credentials: 'include', // Убедитесь, что cookies отправляются
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    setError("У вас ещё нет купленых игр. Всё ещё впереди!");
                    return;
                }
            }

            const data = await response.json();
            setProducts(data);

        } catch (e) {
            setError(e.message);
        }
    };

    fetchGames();
    }, []);

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Личный кабинет</h1>
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Имя пользователя: {localStorage.getItem('Username')}</h5>
                    <p className="card-text">Адрес электронной почты: {localStorage.getItem('Email')}</p>
                    <p className="card-text">Дата регистрации: {localStorage.getItem('CreatedAt')}</p>
                    <button type="button" class="btn btn-danger" onClick={handleLogout}>Выйти</button>
                </div>
            </div>
            <hr class="my-4"/>
            <h2>Библиотека</h2>
            {error ? (
                <p className="text-center">{error}</p>
            ) : (
                <div>
                <ul className="list-group">
                    {products.map(item => (
                    <li key={item.gameId} className="list-group-item d-flex justify-content-between align-items-center">
                        <img src={item.imageURL} alt={item.title} className="game-cover me-3" />
                        <strong>{item.title}</strong> {item.developer} | {item.publisher}
                    </li>
                    ))}
                </ul>
                </div>
            )}
            <img src="https://localhost:7099/file/img/knight_library.jfif" alt="knight_library" height={320}/>
        </div>
    );
};

export default ProfilePage;