import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() { //Ввод параметров с помощью useState
    const [username, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try { //Отправляем Post запрос на регистрацию
        const response = await fetch('https://localhost:7099/Register', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }), // Добавляем поле login
        });

        const data = await response.json();

        if (response.ok) {
            navigate('/login'); // Перенаправляем на страницу входа после успешной регистрации
        } else {
            setError(data.message || 'Ошибка регистрации');
        }
        } catch (err) {
        setError('Ошибка подключения к серверу');
        console.error(err);
        }
    };

    return ( //Форма аналогичная login.js
        <div> 
        <h2>Регистрация</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
            <div class="mb-3">
                <label for="exampleInputLogin1" class="form-label">Логин</label>
                <input type="text" class="form-control" id="exampleInputLogin1"
                    value={username}
                    onChange={(e) => setLogin(e.target.value)} 
                    required
                />
            </div>
            <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Адрес электронной почты</label>
                <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                />
                <div id="emailHelp" class="form-text">Мы никогда не передаём ваш email третьим лицам.</div>
            </div>
            <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label">Пароль</label>
                <input type="password" class="form-control" id="exampleInputPassword1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="exampleCheck1"/>
                <label class="form-check-label" for="exampleCheck1">Отметьте, если согласны на оформление кредитов от вашего лица.</label>
            </div>
            <button type="submit" class="btn btn-primary">Отправить</button>
        </form>

        <p>Уже есть аккаунт? <Link to="/login">Войти здесь</Link></p>
        </div>
    );
};

export default Register;