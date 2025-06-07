import React from 'react';

function SuccessPage() {
  return (
    <div className="container mt-5">
      <img src="https://localhost:7099/file/img/knight_favourite.jfif" alt="Thank you" height={320}/>
      <h2>Покупка успешно завершена!</h2>
      <p>Спасибо за ваш заказ. Ваши игры теперь доступны в вашей библиотеке.</p>
    </div>
  );
}

export default SuccessPage;