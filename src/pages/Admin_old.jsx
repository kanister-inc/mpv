import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

const API_URL = 'http://127.0.0.1:8080';

function Admin() {
  const { products, createProduct, deleteProduct, currentUser } = useData();
  const [activeTab, setActiveTab] = useState('products');

  // Состояния для формы добавления товара
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('electronics');
  const [stock, setStock] = useState('');
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState('');
  const [loading, setLoading] = useState(false);

  // Состояния для редактирования товара
  const [editModal, setEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('electronics');
  const [editStock, setEditStock] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImg, setEditImg] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Заказы из бэка
  const [orders, setOrders] = useState([]);
  const [searchOrder, setSearchOrder] = useState('');

  // Пользователи из бэка (пока заглушка)
  const [users] = useState([
    { id: 1, name: 'Администратор', email: 'admin@mpv.ru', role: 'admin' },
    { id: 2, name: 'Иван Покупатель', email: 'user@mpv.ru', role: 'customer' },
  ]);

  // Загрузка заказов при переключении на вкладку
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          'X-User-Id': String(currentUser?.id || ''),
          'X-User-Role': currentUser?.role || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const idStr = String(order.ID || order.id || '');
    return idStr.endsWith(searchOrder) || searchOrder === '';
  });

  // Открыть модалку редактирования и заполнить поля
  const handleEditOpen = (product) => {
    setEditProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditCategory(product.category);
    setEditStock(String(product.stock));
    setEditDesc(product.desc || '');
    setEditImg(product.img || '');
    setEditModal(true);
  };

  // Отправка изменений на бэкенд
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/products/update?id=${editProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUser?.id || ''),
          'X-User-Role': currentUser?.role || ''
        },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          price: parseFloat(editPrice),
          category: editCategory,
          stock: parseInt(editStock),
          img: editImg || '/images/default.jpg'
        })
      });

      if (response.ok) {
        alert('Товар успешно обновлён!');
        setEditModal(false);
        // Обновляем страницу чтобы подтянуть новые данные
        window.location.reload();
      } else {
        alert('Ошибка при обновлении товара на сервере.');
      }
    } catch (error) {
      alert('Ошибка сети при обновлении товара.');
    }

    setEditLoading(false);
  };

  // Удаление товара
  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    const res = await deleteProduct(id);
    if (res.success) {
      alert('Товар успешно удален из базы данных!');
    } else {
      alert(res.message || 'Ошибка удаления');
    }
  };

  // Изменение статуса заказа
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUser?.id || ''),
          'X-User-Role': currentUser?.role || ''
        },
        body: JSON.stringify({ orderId: Number(orderId), status: newStatus })
      });

      if (response.ok) {
        setOrders(orders.map(o => (o.ID === orderId || o.id === orderId) ? { ...o, status: newStatus } : o));
        alert('Статус заказа успешно обновлён!');
      } else {
        alert('Не удалось обновить статус на сервере.');
      }
    } catch (error) {
      alert('Ошибка сети: сервер бэкенда недоступен.');
    }
  };

  // Добавление нового товара
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
      setName(''); setPrice(''); setStock(''); setDesc(''); setImg('');
      setShowModal(false);
    } else {
      alert(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Панель администратора MPV 🛡️</h2>

      <div className="btn-group mb-4 w-100 shadow-sm">
        <button className={`btn py-2 ${activeTab === 'products' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('products')}>📦 Товары</button>
        <button className={`btn py-2 ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('orders')}>📑 Заказы</button>
        <button className={`btn py-2 ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('users')}>👥 Пользователи</button>
      </div>

      {/* ВКЛАДКА: Товары */}
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
                  <td>{p.category === 'electronics' ? 'Электроника' : p.category === 'clothes' ? 'Одежда' : p.category}</td>
                  <td><span className="badge bg-light text-dark border">{p.stock} шт</span></td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2 fw-bold" onClick={() => handleEditOpen(p)}>Редактировать</button>
                    <button className="btn btn-danger btn-sm fw-bold" onClick={() => handleDelete(p.id)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ВКЛАДКА: Заказы */}
      {activeTab === 'orders' && (
        <div className="card p-4 shadow-sm border-0">
          <div className="mb-4">
            <label className="form-label fw-bold text-muted small">Поиск заказа (последние 4 знака ID):</label>
            <input type="text" className="form-control form-control-lg" maxLength="4" placeholder="Например: de4d" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} />
          </div>
          {orders.length === 0 ? (
            <p className="text-muted text-center py-4">Заказов пока нет.</p>
          ) : (
            <table className="table align-middle">
              <thead>
                <tr><th>ID заказа</th><th>Покупатель</th><th>Сумма</th><th>Статус заказа</th></tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr key={o.ID || o.id}>
                    <td><code>...{String(o.ID || o.id).slice(-4)}</code></td>
                    <td className="fw-bold">{o.user || o.User || `User #${o.user_id || o.UserID}`}</td>
                    <td>{(o.total || o.Total || 0).toLocaleString()} ₽</td>
                    <td>
                      <select className="form-select form-select-sm fw-bold text-primary" value={o.status || o.Status || 'Новый'} onChange={(e) => handleStatusChange(o.ID || o.id, e.target.value)}>
                        <option>Новый</option>
                        <option>В обработке</option>
                        <option>Доставлен</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ВКЛАДКА: Пользователи */}
      {activeTab === 'users' && (
        <div className="card p-4 shadow-sm border-0">
          <h5 className="fw-bold mb-3">База пользователей маркетплейса</h5>
          <table className="table align-middle">
            <thead>
              <tr><th>Имя</th><th>Email</th><th>Роль</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="fw-bold">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge bg-secondary px-3 py-2">{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* МОДАЛКА: Добавление товара */}
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
                    <input type="text" className="form-control" placeholder="/images/headphones.jpg" value={img} onChange={(e) => setImg(e.target.value)} />
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

      {/* МОДАЛКА: Редактирование товара */}
      {editModal && editProduct && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Редактировать товар</h5>
                <button type="button" className="btn-close" onClick={() => setEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Название товара *</label>
                    <input type="text" className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label small fw-bold text-muted">Цена *</label>
                      <input type="number" min="1" className="form-control" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required />
                    </div>
                    <div className="col">
                      <label className="form-label small fw-bold text-muted">Количество *</label>
                      <input type="number" min="0" className="form-control" value={editStock} onChange={(e) => setEditStock(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Категория</label>
                    <select className="form-select" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                      <option value="electronics">Электроника</option>
                      <option value="clothes">Одежда</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Путь к картинке</label>
                    <input type="text" className="form-control" placeholder="/images/headphones.jpg" value={editImg} onChange={(e) => setEditImg(e.target.value)} />
                    {editImg && (
                      <img
                        src={editImg.startsWith('http') ? editImg : `/mpv${editImg}`}
                        alt="preview"
                        className="mt-2 rounded border"
                        style={{ height: '80px', objectFit: 'contain', background: '#f8f9fa' }}
                      />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Описание</label>
                    <textarea className="form-control" rows="3" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary fw-bold" onClick={() => setEditModal(false)}>Отмена</button>
                  <button type="submit" disabled={editLoading} className="btn btn-warning fw-bold">{editLoading ? 'Сохранение...' : 'Сохранить изменения'}</button>
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