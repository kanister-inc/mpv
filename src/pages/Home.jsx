import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

function Home() {
  const { products, cart, addToCart, removeFromCartOne, toggleFavorite, favorites } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'asc') return a.price - b.price;
    if (sortOrder === 'desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="row g-4">
      {/* Левая колонка: Фильтры */}
      <div className="col-lg-3 col-md-4">
        <div className="card p-3 shadow-sm border-0 sticky-top" style={{ top: '20px', zIndex: 10 }}>
          <h5 className="mb-3 fw-bold">Фильтры</h5>
          <div className="mb-4">
            <label className="form-label text-muted small uppercase fw-bold">Категория</label>
            <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">Все категории</option>
              <option value="electronics">Электроника</option>
              <option value="clothes">Одежда</option>
            </select>
          </div>
          <div>
            <label className="form-label text-muted small uppercase fw-bold">Сортировка</label>
            <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="default">По умолчанию</option>
              <option value="asc">Сначала дешевые</option>
              <option value="desc">Сначала дорогие</option>
            </select>
          </div>
        </div>
      </div>

      {/* Правая колонка: Поиск и Сетка товаров */}
      <div className="col-lg-9 col-md-8">
        <div className="mb-4 shadow-sm rounded">
          <input type="text" className="form-control form-control-lg border-0" placeholder="Поиск товаров на MPV..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* Адаптивная сетка */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 g-4">
          {sortedProducts.map((product) => {
            const cartItem = cart.find(item => item.id === product.id);
            const isFavorite = favorites.includes(product.id);
            const isOutOfStock = product.stock <= 0;

            return (
              <div className="col" key={product.id}>
                <div className="card h-100 shadow-sm border-0 d-flex flex-column rounded-3 overflow-hidden position-relative">
                  
                  {/* ⭐ Кнопка Избранного (Сердечко поверх картинки) */}
                  <button 
                    className="btn position-absolute top-0 end-0 m-2 p-2 rounded-circle bg-white shadow-sm border-0"
                    style={{ zIndex: 5, width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => toggleFavorite(product.id)}
                    title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
                  >
                    <span style={{ fontSize: '1.2rem', color: isFavorite ? '#dc3545' : '#ccc' }}>
                      {isFavorite ? '❤️' : '🤍'}
                    </span>
                  </button>

                  {/* Изображение товара */}
                  <div className="p-3 bg-light d-flex align-items-center justify-content-center position-relative" style={{ height: '200px' }}>
                    <img 
                      src={product.img.startsWith('http') ? product.img : product.img} 
                      className="img-fluid" 
                      alt={product.name} 
                      style={{ maxHeight: '100%', objectFit: 'contain', filter: isOutOfStock ? 'grayscale(60%)' : 'none' }} 
                    />
                    {isOutOfStock && (
                      <span className="badge bg-danger position-absolute bottom-0 start-0 m-2 px-2 py-1 small fw-bold shadow-sm">
                        Нет в наличии
                      </span>
                    )}
                  </div>

                  {/* Тело карточки */}
                  <div className="card-body d-flex flex-column p-3">
                    <h5 className="card-title fs-6 mb-1">
                      <Link to={`/product/${product.id}`} className="text-decoration-none text-dark fw-bold line-clamp">
                        {product.name}
                      </Link>
                    </h5>
                    
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">
                        {product.category === 'electronics' ? 'Электроника' : 'Одежда'}
                      </span>
                      {/* Показываем остаток товара на складе */}
                      {!isOutOfStock && (
                        <span className="text-success small fw-bold bg-success-subtle px-2 py-0.5 rounded">
                          📦 Склад: {product.stock} шт.
                        </span>
                      )}
                    </div>

                    <h5 className="mt-auto text-primary fw-bold mb-3">{product.price.toLocaleString()} ₽</h5>
                    
                    {/* Управление корзиной с валидацией остатков склада */}
                    {isOutOfStock ? (
                      <button className="btn btn-secondary w-100 py-2 fw-bold rounded-3" disabled>
                        Закончился
                      </button>
                    ) : cartItem ? (
                      <div className="d-flex align-items-center justify-content-between border rounded-3 p-1 bg-white shadow-sm w-100">
                        <button className="btn btn-outline-danger border-0 px-3 fw-bold" onClick={() => removeFromCartOne(product.id)}>
                          —
                        </button>
                        <span className="fw-bold px-2 text-dark">{cartItem.qty} шт</span>
                        <button 
                          className="btn btn-outline-success border-0 px-3 fw-bold" 
                          onClick={() => addToCart(product.id)}
                          disabled={cartItem.qty >= product.stock} // Блокируем плюс, если в корзине максимум
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-primary w-100 py-2 fw-bold rounded-3" onClick={() => addToCart(product.id)}>
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
    </div>
  );
}

export default Home;
