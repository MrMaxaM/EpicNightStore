import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() { //Ввод параметров с помощью useState
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Отправляем POST запрос на авторизацию
            const authResponse = await fetch('https://localhost:7099/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Убедитесь, что cookies отправляются
            });

            const authData = await authResponse.json();

            if (authResponse.ok) {
                localStorage.setItem('token', authData.token);

                // Отправляем GET запрос для получения профиля пользователя
                const profileResponse = await fetch('https://localhost:7099/GetUserProfile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authData.token}`, // Добавляем токен аутентификации
                    },
                    credentials: 'include', // Убедитесь, что cookies отправляются
                });

                const profileData = await profileResponse.json();

                if (profileResponse.ok) {
                    localStorage.setItem('Username', profileData.username);
                    localStorage.setItem('Email', profileData.email);
                    localStorage.setItem('CreatedAt', profileData.createdAt);
                    localStorage.setItem('Role', profileData.role);
                } else {
                    setError(profileData.message || 'Ошибка при получении профиля пользователя');
                }

                navigate('/'); // Перенаправляем на главную страницу
            } else {
                // При вводе неверных данных выводим ошибку
                setError(authData.message || 'Неверный логин или пароль');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
            console.error(err);
        }
    };

    return (//Страница авторизации. Отправление по кнопке, проверка полей на формат
    <div>
        <h2>Авторизация</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
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
                <label class="form-check-label" for="exampleCheck1">Отметьте, если согласны получать рекламные письма.</label>
            </div>
            <button type="submit" class="btn btn-primary">Отправить</button>
        </form>

        <p>Ещё нет аккаунта? <Link to="/register">Зарегистрируйтесь здесь</Link></p>
    </div>
    );
}

export default Login;