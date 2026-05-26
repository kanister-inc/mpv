import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function Cart() {
  const { cart, removeFromCart, currentUser, createOrder } = useData();
  const navigate = useNavigate();

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = () => {
    // 🛡️ ПРОВЕРКА АВТОРИЗАЦИИ [п.1,5]
    if (!currentUser) {
      alert('Для оформления заказа необходимо войти в аккаунт!');
      navigate('/auth'); // Перенаправляем на окно авторизации
      return;
    }

    // Если авторизован — создаем заказ
    createOrder();
    alert('🎉 Заказ успешно оформлен! Данные привязаны к вашему аккаунту.');
    navigate('/profile'); // Переходим в историю заказов
  };

  if (cart.length === 0) {
    return (
      <div className="text-center p-5 mt-5 card shadow-sm border-0 rounded-3">
        <div className="fs-1 mb-3">🛒</div>
        <h3 className="text-muted fw-bold">Ваша корзина пуста</h3>
        <Link to="/" className="btn btn-primary mt-3 px-4 py-2 fw-bold shadow-sm rounded-3">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div className="row g-4 mt-2">
      <div className="col-12"><h2 className="fw-bold mb-2">Ваша корзина</h2></div>
      <div className="col-xl-8 col-lg-7">
        <div className="card p-3 shadow-sm border-0 rounded-3">
          {cart.map(item => (
            <div key={item.id} className="row align-items-center g-3 py-3 border-bottom mx-0">
              <div className="col-sm-2 col-3 text-center">
                <img src={item.img} alt={item.name} className="img-fluid rounded border bg-light p-1" style={{ maxHeight: '70px', objectFit: 'contain' }} />
              </div>
              <div className="col-sm-6 col-9">
                <h6 className="fw-bold mb-1">{item.name}</h6>
                <span className="text-muted small">{item.price.toLocaleString()} ₽ × {item.qty} шт.</span>
              </div>
              <div className="col-sm-4 col-12 d-flex align-items-center justify-content-sm-end justify-content-between mt-sm-0 mt-2">
                <span className="fw-bold fs-5 me-sm-3">{(item.price * item.qty).toLocaleString()} ₽</span>
                <button className="btn btn-outline-danger btn-sm px-3 rounded-3" onClick={() => removeFromCart(item.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-xl-4 col-lg-5">
        <div className="card p-4 shadow-sm border-0 bg-dark text-white rounded-3 sticky-top" style={{ top: '20px' }}>
          <h5 className="fw-bold text-muted small uppercase mb-3">Детали заказа</h5>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="fs-5 text-secondary">Итого к оплате:</span>
            <span className="fs-3 fw-bold text-warning">{(totalPrice).toLocaleString()} ₽</span>
          </div>
          <button className="btn btn-warning w-100 py-3 fw-bold text-dark shadow rounded-3 fs-5" onClick={handleCheckout}>
            Оформить заказ
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
