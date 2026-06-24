import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

function Favorites() {
  const { favorites, products, addToCart, toggleFavorite, currentUser } = useData();

  if (!currentUser) {
    return (
      <div className="text-center p-5">
        <h3 className="mb-3">Вы не авторизованы 🔒</h3>
        <p className="text-muted">Войдите в аккаунт чтобы видеть избранные товары.</p>
        <Link to="/auth" className="btn btn-primary fw-bold">Войти</Link>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center p-5">
        <span className="fs-1 d-block mb-3">🤍</span>
        <h3 className="mb-2">Избранное пусто</h3>
        <p className="text-muted mb-4">Добавляйте товары в избранное нажав на сердечко.</p>
        <Link to="/" className="btn btn-primary fw-bold px-4">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Избранное ❤️ <span className="text-muted fs-5 fw-normal">({favorites.length})</span></h2>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {favorites.map((favId) => {
          const product = products.find(p => p.id === favId);

          // Товар удалён — показываем карточку-заглушку
          if (!product) {
            return (
              <div className="col" key={favId}>
                <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden position-relative opacity-75">
                  <div className="p-3 bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                    <span className="fs-1">🗑️</span>
                  </div>
                  <div className="card-body p-3">
                    <div className="alert alert-warning py-2 small mb-2 text-center rounded-3">
                      Товар был удалён с маркетплейса
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm w-100 fw-bold"
                      onClick={() => toggleFavorite(favId)}
                    >
                      Убрать из избранного
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          const isOutOfStock = product.stock <= 0;

          return (
            <div className="col" key={product.id}>
              <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden position-relative">

                {/* Кнопка убрать из избранного */}
                <button
                  className="btn position-absolute top-0 end-0 m-2 p-2 rounded-circle bg-white shadow-sm border-0"
                  style={{ zIndex: 5, width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => toggleFavorite(product.id)}
                  title="Убрать из избранного"
                >
                  <span style={{ fontSize: '1.2rem' }}>❤️</span>
                </button>

                {/* Картинка */}
                <Link to={`/product/${product.id}`}>
                  <div className="p-3 bg-light d-flex align-items-center justify-content-center position-relative" style={{ height: '180px' }}>
                    <img
                      src={product.img.startsWith('http') ? product.img : `/mpv${product.img}`}
                      className="img-fluid"
                      alt={product.name}
                      style={{ maxHeight: '100%', objectFit: 'contain', filter: isOutOfStock ? 'grayscale(60%)' : 'none' }}
                    />
                    {isOutOfStock && (
                      <span className="badge bg-danger position-absolute bottom-0 start-0 m-2 px-2 py-1 small fw-bold">
                        Нет в наличии
                      </span>
                    )}
                  </div>
                </Link>

                {/* Тело карточки */}
                <div className="card-body d-flex flex-column p-3">
                  <h6 className="fw-bold mb-1">
                    <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                      {product.name}
                    </Link>
                  </h6>
                  <span className="text-muted small mb-2">
                    {product.category === 'electronics' ? 'Электроника' : product.category === 'clothes' ? 'Одежда' : product.category}
                  </span>
                  <h6 className="text-primary fw-bold mt-auto mb-3">{product.price.toLocaleString()} ₽</h6>

                  {isOutOfStock ? (
                    <button className="btn btn-secondary btn-sm w-100 fw-bold" disabled>Закончился</button>
                  ) : (
                    <button className="btn btn-primary btn-sm w-100 fw-bold" onClick={() => addToCart(product.id)}>
                      В корзину
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Favorites;