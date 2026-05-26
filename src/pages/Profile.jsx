import React from 'react';
import { useData } from '../context/DataContext';

function Profile() {
  // Достаем текущего юзера и все заказы из базы фронтенда [п.5]
  const { currentUser, orders } = useData();

  // Фильтруем заказы: показываем только те, которые принадлежат текущему пользователю [п.5]
  const myOrders = orders.filter(order => order.userId === currentUser?.id);

  if (!currentUser) return null; // Предохранитель, если юзер не залогинен

  return (
    <div className="row g-4 mt-2">
      {/* Карточка пользователя */}
      <div className="col-md-4">
        <div className="card p-4 shadow-sm border-0 text-center rounded-3 bg-white">
          <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto" style={{ width: '80px', height: '80px' }}>
            <span className="fs-2">👤</span>
          </div>
          <h5 className="fw-bold mb-1">{currentUser.name}</h5>
          <p className="text-muted small mb-3">{currentUser.email}</p>
          <span className="badge bg-success px-3 py-2 text-uppercase">
            Роль: {currentUser.role === 'admin' ? 'Администратор' : 'Покупатель'}
          </span>
        </div>
      </div>

      {/* История личных заказов с содержанием [п.5] */}
      <div className="col-md-8">
        <div className="card p-4 shadow-sm border-0 rounded-3 bg-white">
          <h5 className="fw-bold mb-4">История ваших заказов</h5>
          
          {myOrders.length > 0 ? (
            myOrders.map(order => (
              <div key={order.id} className="card p-3 mb-3 border-0 bg-light rounded-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <span className="fw-bold text-dark">Заказ <code>#{order.id}</code></span>
                  <span className={`badge ${order.status === 'Доставлен' ? 'bg-success' : 'bg-primary'} px-3 py-1.5 rounded-pill`}>
                    {order.status}
                  </span>
                </div>
                <div className="small text-muted mb-3">Дата оформления: {order.date}</div>
                
                {/* Подробное содержание заказа (наименования, цены, количества) [п.5] */}
                <div className="bg-white p-3 rounded-3 mb-3 border">
                  <h6 className="fw-bold small text-muted uppercase mb-2">Содержимое заказа:</h6>
                  {order.items.map(item => (
                    <div key={item.id} className="d-flex justify-content-between small py-1 border-bottom-dashed">
                      <span>{item.name} <strong className="text-muted">× {item.qty} шт.</strong></span>
                      <span className="fw-bold">{item.price.toLocaleString()} ₽</span>
                    </div>
                  ))}
                </div>
                
                <div className="fw-bold text-dark fs-5 text-end">Итоговая сумма: <span className="text-primary">{order.total.toLocaleString()} ₽</span></div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-4">
              <p className="mb-0">Вы еще не совершали покупок на MPV.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
