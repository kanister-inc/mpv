import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function Profile() {
  const { currentUser, logoutUser, createProduct, orders, setOrders } = useData();
  const navigate = useNavigate();

  // Состояния для формы создания товара продавцом
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('electronics');
  const [stock, setStock] = useState('');
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Загружаем личную историю заказов из SQLite при открытии профиля покупателем
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'customer') return;

    const fetchMyOrders = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/orders/my`, {
          headers: {
            'X-User-Id': String(currentUser.id),
            'X-User-Role': currentUser.role
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Не удалось загрузить историю заказов:', error);
      }
    };

    fetchMyOrders();
  }, [currentUser, setOrders]);
  // Если пользователь стёр сессию или не вошел, просим авторизоваться
  if (!currentUser) {
    return (
      <div className="text-center p-5">
        <h3 className="mb-3">Вы не авторизованы 🔒</h3>
        <p className="text-muted">Пожалуйста, войдите в свой аккаунт, чтобы просмотреть профиль.</p>
        <button className="btn btn-primary fw-bold" onClick={() => navigate('/auth')}>Войти</button>
      </div>
    );
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    if (!name || !price || !stock) {
      setMessage({ text: 'Заполните обязательные поля (Название, Цена, Склад)!', type: 'danger' });
      setLoading(false);
      return;
    }

    const productData = { name, price: parseFloat(price), category, stock: parseInt(stock), desc, img: img || '/images/default.jpg' };
    const result = await createProduct(productData);

    if (result.success) {
      setMessage({ text: result.message, type: 'success' });
      setName(''); setPrice(''); setStock(''); setDesc(''); setImg('');
    } else {
      setMessage({ text: result.message, type: 'danger' });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/auth');
  };

  const translateStatus = (status) => {
    const statuses = {
      'pending': '⏳ Новый',
      'processing': '⚙️ В обработке',
      'shipped': '🚚 В пути',
      'delivered': '✅ Доставлен',
      'cancelled': '❌ Отменен'
    };
    return statuses[status] || status;
  };

  return (
    <div className="container mt-4">
      <div className="row g-4">
        {/* Левая колонка: Карточка аккаунта */}
        <div className="col-md-4">
          <div className="card p-4 shadow-sm border-0 rounded-3 text-center bg-white">
            <div className="mb-3">
              <span className="fs-1">
                {currentUser.role === 'admin' ? '🛡️' : currentUser.role === 'seller' ? '💼' : '🛍️'}
              </span>
            </div>
            <h4 className="fw-bold mb-1">{currentUser.name}</h4>
            <p className="text-muted small mb-3">{currentUser.email}</p>
            <div className="mb-4">
              <span className={`badge px-3 py-2 ${
                currentUser.role === 'admin' ? 'bg-danger' : currentUser.role === 'seller' ? 'bg-warning text-dark' : 'bg-primary'
              }`}>
                {currentUser.role === 'admin' ? 'Администратор' : currentUser.role === 'seller' ? 'Продавец' : 'Покупатель'}
              </span>
            </div>
            <hr />
            <button className="btn btn-outline-danger w-100 fw-bold rounded-3 mt-2" onClick={handleLogout}>
              Выйти из аккаунта
            </button>
          </div>
        </div>
        {/* Правая колонка: Контент под каждую роль */}
        <div className="col-md-8">
          {currentUser.role === 'admin' ? (
            <div className="card p-4 shadow-sm border-0 rounded-3 bg-white text-center py-5">
              <span className="fs-1 mb-3 d-block">🛡️</span>
              <h4 className="fw-bold text-dark">Вы авторизованы как Администратор</h4>
              <p className="text-muted">Управление маркетплейсом находится в специальном общем разделе.</p>
              <button className="btn btn-primary fw-bold px-4 py-2" onClick={() => navigate('/admin')}>
                Перейти в Панель управления
              </button>
            </div>
          ) : currentUser.role === 'seller' ? (
            <div className="card p-4 shadow-sm border-0 rounded-3 bg-white">
              <h4 className="fw-bold mb-4">Управление складом 📦</h4>
              <h5 className="text-muted small uppercase fw-bold mb-3">Добавить новый товар в магазин</h5>

              {message.text && (
                <div className={`alert alert-${message.type} py-2 small text-center rounded-3`} role="alert">
                  {message.text}
                </div>
              )}

              <form onSubmit={handleCreateProduct}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Название товара *</label>
                    <input type="text" className="form-control rounded-3" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Категория</label>
                    <select className="form-select rounded-3" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="electronics">Электроника</option>
                      <option value="clothes">Одежда</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Цена (в ₽) *</label>
                    <input type="number" min="1" className="form-control rounded-3" value={price} onChange={(e) => setPrice(e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Количество на складе *</label>
                    <input type="number" min="0" className="form-control rounded-3" value={stock} onChange={(e) => setStock(e.target.value)} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Ссылка на изображение</label>
                    <input type="text" className="form-control rounded-3" placeholder="/images/default.jpg" value={img} onChange={(e) => setImg(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Описание товара</label>
                    <textarea className="form-control rounded-3" rows="3" value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-success px-5 py-2 fw-bold rounded-3 shadow-sm mt-4">
                  {loading ? 'Сохранение...' : '🚀 Опубликовать на маркетплейсе'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card p-4 shadow-sm border-0 rounded-3 bg-white">
              <h4 className="fw-bold mb-4">История ваших заказов 🛍️</h4>
              
              {orders.length === 0 ? (
                <div className="text-center py-5">
                  <span className="fs-2 mb-2 d-block">📦</span>
                  <p className="text-muted mb-0">Вы еще не совершили ни одного заказа.</p>
                </div>
              ) : (
                <div className="accordion" id="ordersAccordion">
                  {orders.map((order) => (
                    <div className="accordion-item mb-3 border rounded-3 overflow-hidden shadow-sm" key={order.id || order.ID}>
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed bg-light text-dark fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#collapseOrder${order.id || order.ID}`}>
                          <div className="d-flex justify-content-between w-100 me-3 align-items-center">
                            <span>Заказ №{order.id || order.ID}</span>
                            <span className="text-primary">{(order.total_price || order.total || 0).toLocaleString()} ₽</span>
                            <span className="badge bg-white text-dark border small">{translateStatus(order.status)}</span>
                          </div>
                        </button>
                      </h2>
                      <div id={`collapseOrder${order.id || order.ID}`} className="accordion-collapse collapse" data-bs-parent="#ordersAccordion">
                        <div className="accordion-body bg-white">
                          <h6 className="fw-bold mb-3 text-muted small text-uppercase">Состав заказа:</h6>
                          <ul className="list-group list-group-flush mb-0">
                            {order.items && order.items.map((item, idx) => (
                              <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2" key={idx}>
                                <div>
                                  <span className="fw-bold">Товар ID: {item.product_id || item.productId}</span>
                                  <span className="text-muted small ms-2">({item.quantity || item.qty} шт.)</span>
                                </div>
                                <span className="text-muted">{(item.price || 0).toLocaleString()} ₽ / шт</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
