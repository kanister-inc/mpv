import React, { useState } from 'react';
import { useData } from '../context/DataContext';

function Admin() {
  const { products, createProduct, deleteProduct } = useData();
  const [activeTab, setActiveTab] = useState('products');

  // Состояния для формы нового товара
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('electronics');
  const [stock, setStock] = useState('');
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState('');
  const [loading, setLoading] = useState(false);

  // Временные состояния для вкладок, под которые мы еще не написали бэкенд
  const [users, setUsers] = useState([
    { id: 1, name: 'Администратор', email: 'admin@mpv.ru', role: 'admin' },
    { id: 2, name: 'Иван Покупатель', email: 'user@mpv.ru', role: 'customer' },
  ]);
  const [orders, setOrders] = useState([
    { id: '9b1deb4d', user: 'Иван Покупатель', total: 3500, status: 'Новый' },
  ]);

  const [searchOrder, setSearchOrder] = useState('');

  const filteredOrders = orders.filter(order => 
    order.id.endsWith(searchOrder)
  );

  const toggleRole = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: u.role === 'customer' ? 'admin' : 'customer' } : u));
  };

  // Обработчик удаления
  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    const res = await deleteProduct(id);
    if (res.success) {
      alert('Товар успешно удален из базы данных!');
    } else {
      alert(res.message || 'Ошибка удаления');
    }
  };
  // Настоящее изменение статуса заказа через Go-бэкенд
   // Настоящее изменение статуса заказа через Go-бэкенд
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUser?.id || ''),
          'X-User-Role': currentUser?.role || ''
        },
        // Исправлено: убран uint, оставлен чистый перевод ID в число
        body: JSON.stringify({ orderId: Number(orderId), status: newStatus })
      });

      if (response.ok) {
        // Обновляем статус локально в стейте, чтобы таблица сразу перерисовалась
        setOrders(orders.map(o => (o.ID === orderId || o.id === orderId) ? { ...o, status: newStatus } : o));
        alert('Статус заказа успешно сохранен в базу!');
      } else {
        alert('Не удалось обновить статус на сервере.');
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      alert('Ошибка сети: сервер бэкенда недоступен.');
    }
  };


  // Обработчик отправки формы добавления товара
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      name,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      desc,
      img: img || '/images/default.jpg'
    };

    const res = await createProduct(productData);
    if (res.success) {
      alert(res.message);
      // Очищаем форму и закрываем модалку
      setName('');
      setPrice('');
      setStock('');
      setDesc('');
      setImg('');
      setShowModal(false);
    } else {
      alert(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Панель администратора MPV 🛡️</h2>
      
      {/* Меню переключения вкладок */}
      <div className="btn-group mb-4 w-100 shadow-sm">
        <button className={`btn py-2 ${activeTab === 'products' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('products')}>📦 Товары</button>
        <button className={`btn py-2 ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('orders')}>📑 Заказы</button>
        <button className={`btn py-2 ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('users')}>👥 Пользователи</button>
      </div>

      {/* ВКЛАДКА 1: Управление товарами */}
      {activeTab === 'products' && (
        <div className="card p-4 shadow-sm border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold">Список товаров на платформе</h5>
            <button className="btn btn-success btn-sm fw-bold" onClick={() => setShowModal(true)}>+ Добавить товар</button>
          </div>
          <table className="table align-middle">
            <thead>
              <tr><th>Название</th><th>Цена</th><th>Категория</th><th>Остаток</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="fw-bold">{p.name}</td>
                  <td>{p.price.toLocaleString()} ₽</td>
                  <td>{p.category === 'electronics' ? 'Электроника' : 'Одежда'}</td>
                  <td><span className="badge bg-light text-dark border">{p.stock} шт</span></td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2 fw-bold">Редактировать</button>
                    <button className="btn btn-danger btn-sm fw-bold" onClick={() => handleDelete(p.id)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ВКЛАДКА 2: Управление заказами */}
      {activeTab === 'orders' && (
        <div className="card p-4 shadow-sm border-0">
          <div className="mb-4">
            <label className="form-label fw-bold text-muted small uppercase">Поиск заказа (последние 4 знака ID):</label>
            <input type="text" className="form-control form-control-lg" maxLength="4" placeholder="Например: de4d" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} />
          </div>
          <table className="table align-middle">
            <thead>
              <tr><th>ID заказа</th><th>Покупатель</th><th>Сумма</th><th>Статус заказа</th></tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id}>
                  <td><code>...{o.id.slice(-4)}</code></td><td className="fw-bold">{o.user}</td><td>{o.total.toLocaleString()} ₽</td>
                  <td>
                    <select className="form-select form-select-sm fw-bold text-primary" value={o.status} onChange={(e) => alert(`Статус изменен на ${e.target.value}`)}>
                      <option>Новый</option><option>В обработке</option><option>Доставлен</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ВКЛАДКА 3: Управление пользователями */}
      {activeTab === 'users' && (
        <div className="card p-4 shadow-sm border-0">
          <h5 className="fw-bold mb-3">База пользователей маркетплейса</h5>
          <table className="table align-middle">
            <thead>
              <tr><th>Имя</th><th>Email</th><th>Текущая Роль</th><th>Действие</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="fw-bold">{u.name}</td><td>{u.email}</td><td><span className="badge bg-secondary px-3 py-2">{u.role}</span></td>
                  <td>
                    <button className="btn btn-dark btn-sm fw-bold" onClick={() => toggleRole(u.id)}>Сменить роль</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📜 МОДАЛЬНОЕ ОКНО ДЛЯ ДОБАВЛЕНИЯ ТОВАРA АДМИНОМ */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Добавить новый товар</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitProduct}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Название товара *</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label small fw-bold text-muted">Цена *</label>
                      <input type="number" min="1" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    <div className="col">
                      <label className="form-label small fw-bold text-muted">Количество *</label>
                      <input type="number" min="0" className="form-control" value={stock} onChange={(e) => setStock(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Категория</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="electronics">Электроника</option>
                      <option value="clothes">Одежда</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Путь к картинке</label>
                    <input type="text" className="form-control" placeholder="/images/default.jpg" value={img} onChange={(e) => setImg(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Описание</label>
                    <textarea className="form-control" rows="3" value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary fw-bold" onClick={() => setShowModal(false)}>Отмена</button>
                  <button type="submit" disabled={loading} className="btn btn-success fw-bold">{loading ? 'Сохранение...' : 'Создать'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
