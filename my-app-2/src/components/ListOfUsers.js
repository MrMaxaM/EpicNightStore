import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

function ListOfUsers() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [developer, setDeveloper] = useState('');
    const [publisher, setPublisher] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const game = {
        title,
        description,
        price: parseFloat(price),
        releaseDate: new Date(releaseDate),
        developer,
        publisher,
        imageUrl
        };

        try {
        const response = await fetch('https://localhost:7099/AddGame', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(game)
        });

        if (!response.ok) {
            throw new Error('Failed to add game');
        }

        } catch (error) {
        console.error('Error adding game:', error);
        alert('Error adding game. Please try again.');
        }
    };

    useEffect(() => {
        
        console.log("Token в ListOfUsers:", token);
        const fetchUsers = async () => {
        try {
            const response = await fetch('https://localhost:7099/GetAllUsers', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
            });
            
            if (!response.ok) {
                if (response.status === 403) {
                    setError("У вас нет прав для просмотра этой страницы.");
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setUsers(data);

        } catch (e) {
            setError(e.message);
        }
    };

    fetchUsers();
    }, []);

    if (error) {
        return <div className="text-center" style={{ color: 'red' }}>Ошибка: {error}</div>;
    }
    
    return (
    <div className="text-center">
        <h1 className="display-4">Добро пожаловать!</h1>
        <h2>Таблица зарегистрированных пользователей</h2>

        {users && users.length > 0 ? (
        <table className="table" style={{ maxWidth: '80%', margin: 'auto'}}>
            <thead>
            <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th style={{ width: '50px' }}>Имя</th>
                <th style={{ width: '50px' }}>Email</th>
                <th style={{ width: '50px' }}>Дата регистрации</th>
                <th style={{ width: '50px' }}>Роль</th>
            </tr>
            </thead>
            <tbody>
            {users.map(user => (
                <tr key={user.userId}>
                    <td>{user.userId}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{format(parseISO(user.createdAt), 'dd MMMM yyyy, HH:mm:ss')}</td>
                    <td>{user.role}</td>
                </tr>
            ))}
            </tbody>
        </table>
        ) : (
        <p>Пользователи не найдены.</p>
        )}
        <h2>Добавить новую игру</h2>
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
            <label htmlFor="title" className="form-label">Название</label>
            <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            </div>
            <div className="mb-3">
            <label htmlFor="description" className="form-label">Описание</label>
            <textarea
                className="form-control"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            ></textarea>
            </div>
            <div className="mb-3">
            <div className="mb-3">
            <label htmlFor="developer" className="form-label">Разработчик</label>
            <input
                type="text"
                className="form-control"
                id="developer"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                required
            />
            </div>
            <div className="mb-3">
            <label htmlFor="publisher" className="form-label">Издатель</label>
            <input
                type="text"
                className="form-control"
                id="publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                required
            />
            </div>
            <label htmlFor="price" className="form-label">Цена</label>
            <input
                type="number"
                className="form-control"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
            />
            </div>
            <div className="mb-3">
            <label htmlFor="releaseDate" className="form-label">Дата выпуска</label>
            <input
                type="date"
                className="form-control"
                id="releaseDate"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
            />
            </div>
            <div className="mb-3">
            <label htmlFor="imageUrl" className="form-label">Ссылка на изображение</label>
            <input
                type="url"
                className="form-control"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
            />
            </div>
            <button type="submit" className="btn btn-primary">Добавить игру</button>
        </form>
    </div>
    );
};
    
export default ListOfUsers;
