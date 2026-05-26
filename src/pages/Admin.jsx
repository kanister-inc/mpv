import React, { useState } from 'react';

function Admin() {
  // Переключение вкладок в админке
  const [activeTab, setActiveTab] = useState('products');

  // Фейковые данные для наглядности (потом пойдут с Go-бэкенда друга)
  const [products, setProducts] = useState([
    { id: 1, name: 'Смартфон MPV Ultra', price: 69990, category: 'Электроника' },
  ]);
  const [users, setUsers] = useState([
    { id: 1, name: 'Иван Иванов', email: 'ivan@mail.ru', role: 'user' },
    { id: 2, name: 'Петр Петров', email: 'petr@seller.ru', role: 'seller' },
  ]);
  const [orders, setOrders] = useState([
    { id: '9b1deb4d', user: 'Иван Иванов', total: 69990, status: 'Новый' },
  ]);

  const [searchOrder, setSearchOrder] = useState('');

  // Поиск по 4 последним символам заказа [п.7]
  const filteredOrders = orders.filter(order => 
    order.id.endsWith(searchOrder)
  );

  // Смена роли пользователя [п.10]
  const toggleRole = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: u.role === 'user' ? 'admin' : 'user' } : u));
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Панель администратора MPV 🛡️</h2>
      
      {/* Меню переключения вкладок */}
      <div className="btn-group mb-4 w-100 shadow-sm">
        <button className={`btn py-2 ${activeTab === 'products' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('products')}>📦 Товары (CRUD) [п.4]</button>
        <button className={`btn py-2 ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('orders')}>📑 Заказы [п.7]</button>
        <button className={`btn py-2 ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('users')}>👥 Пользователи [п.8,9,10]</button>
      </div>

      {/* ВКЛАДКА 1: Управление товарами [п.4] */}
      {activeTab === 'products' && (
        <div className="card p-4 shadow-sm border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold">Список товаров на платформе</h5>
            <button className="btn btn-success btn-sm fw-bold">+ Добавить товар</button>
          </div>
          <table className="table align-middle">
            <thead>
              <tr><th>Название</th><th>Цена</th><th>Категория</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="fw-bold">{p.name}</td><td>{p.price.toLocaleString()} ₽</td><td>{p.category}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2 fw-bold">Редактировать</button>
                    <button className="btn btn-danger btn-sm fw-bold">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ВКЛАДКА 2: Управление заказами [п.7] */}
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

      {/* ВКЛАДКА 3: Управление пользователями [п.8,9,10] */}
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
    </div>
  );
}

export default Admin;
