import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext'; // 1. Импортируем наше хранилище [п.11]

function ProductDetails() {
  const { id } = useParams(); // Получаем ID товара из ссылки сайта

  // 2. Забираем товары и функцию добавления в корзину из единого центра! [п.5,6]
  const { products, addToCart } = useData();

  // Находим нужный товар в едином массиве по его ID
  const product = products.find(p => p.id === parseInt(id));

  // Если вдруг товар не найден (например, ввели кривой ID в ссылку)
  if (!product) {
    return (
      <div className="text-center p-5">
        <h3>Товар не найден 🔍</h3>
        <Link to="/" className="btn btn-primary mt-3">Назад в каталог</Link>
      </div>
    );
  }

  return (
    <div className="card p-4 shadow-sm border-0 mt-4">
      <div className="row">
        <div className="col-md-5 mb-3">
          <img 
            src={product.img} 
            className="img-fluid rounded border bg-light p-3" 
            alt={product.name} 
            style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} 
          />
        </div>
        <div className="col-md-7 d-flex flex-column">
          <span className="badge bg-primary align-self-start mb-2 px-3 py-2">
            {product.category === 'electronics' ? 'Электроника' : 'Одежда'}
          </span>
          <h2 className="fw-bold mb-3">{product.name}</h2>
          <h3 className="text-success fw-bold mb-4">{product.price.toLocaleString()} ₽</h3>
          
          <h5 className="fw-bold mb-2">Описание товара:</h5>
          <p className="text-muted flex-grow-1" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            {product.desc}
          </p>
          
          <div className="mt-4 pt-3 border-top d-flex gap-3">
            {/* Живая кнопка: передает ID в глобальную корзину [п.5] */}
            <button 
              className="btn btn-primary btn-lg px-5 fw-bold" 
              onClick={() => addToCart(product.id)}
            >
              В корзину
            </button>
            <Link to="/" className="btn btn-outline-secondary btn-lg px-4">
              Назад в каталог
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
