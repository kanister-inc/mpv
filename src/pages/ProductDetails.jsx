import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

function ProductDetails() {
  const { id } = useParams();
  const { products, addToCart, toggleFavorite, favorites, currentUser } = useData();

  // Находим нужный товар по ID
  const product = products.find(p => p.id === parseInt(id));

  // Локальное состояние для формы добавления нового отзыва
  const [reviews, setReviews] = useState([
    { id: 1, username: 'Алексей', rating: 5, comment: 'Отличный товар, полностью соответствует описанию!' },
    { id: 2, username: 'Мария', rating: 4, comment: 'Хорошее качество, но доставка немного задержалась.' }
  ]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Проверяем, находится ли данный товар в избранном
  const isFavorite = favorites.includes(product?.id);

  if (!product) {
    return (
      <div className="text-center p-5">
        <h3>Товар не найден 🔍</h3>
        <Link to="/" className="btn btn-primary mt-3">Назад в каталог</Link>
      </div>
    );
  }

  // Обработка отправки отзыва
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Пожалуйста, войдите в аккаунт, чтобы оставить отзыв!');
      return;
    }
    if (!comment.trim()) return;

    const newReview = {
      id: Date.now(),
      username: currentUser.name || 'Покупатель',
      rating: rating,
      comment: comment
    };

    setReviews([newReview, ...reviews]);
    setComment('');
    setRating(5);
    alert('Отзыв успешно добавлен!');
  };

  return (
    <div className="container mt-4">
      {/* Карточка товара */}
      <div className="card p-4 shadow-sm border-0 mb-4 rounded-3">
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
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="badge bg-primary px-3 py-2">
                {product.category === 'electronics' ? 'Электроника' : 'Одежда'}
              </span>
              
              {/* 📦 Информация о наличии на складе */}
              {product.stock > 0 ? (
                <span className="badge bg-success-subtle text-success px-3 py-2 fw-bold">
                  📦 В наличии: {product.stock} шт.
                </span>
              ) : (
                <span className="badge bg-danger-subtle text-danger px-3 py-2 fw-bold">
                  ❌ Нет в наличии
                </span>
              )}
            </div>

            <h2 className="fw-bold mb-3">{product.name}</h2>
            <h3 className="text-success fw-bold mb-4">{product.price.toLocaleString()} ₽</h3>
            
            <h5 className="fw-bold mb-2">Описание товара:</h5>
            <p className="text-muted flex-grow-1" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              {product.desc}
            </p>
            
            <div className="mt-4 pt-3 border-top d-flex gap-3 align-items-center">
              {/* Кнопка добавления в корзину с блокировкой по складу */}
              <button 
                className={`btn btn-lg px-5 fw-bold ${product.stock > 0 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => addToCart(product.id)}
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? 'В корзину' : 'Закончился'}
              </button>

              {/* ⭐ Кнопка Избранного (Сердечко) */}
              <button 
                className={`btn btn-lg ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => toggleFavorite(product.id)}
                title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              >
                {isFavorite ? '❤️ В избранном' : '🤍 В избранное'}
              </button>

              <Link to="/" className="btn btn-outline-secondary btn-lg px-4">
                Назад
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 💬 Блок отзывов и рейтингов */}
      <div className="card p-4 shadow-sm border-0 rounded-3 mb-5">
        <h4 className="fw-bold mb-4">Отзывы покупателей 💬</h4>

        {/* Форма написания отзыва */}
        <form onSubmit={handleReviewSubmit} className="mb-4 p-3 bg-light rounded-3">
          <h6 className="fw-bold mb-3">Оставить свой отзыв:</h6>
          <div className="row g-3 align-items-center mb-3">
            <div className="col-auto">
              <label className="form-label mb-0 fw-bold text-muted small">Ваша оценка:</label>
            </div>
            <div className="col-auto">
              <select className="form-select form-select-sm fw-bold text-warning" value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder={currentUser ? "Напишите ваше мнение о товаре..." : "Пожалуйста, авторизуйтесь для написания отзыва"} 
              disabled={!currentUser}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-sm btn-primary fw-bold px-4" disabled={!currentUser}>
            Отправить отзыв
          </button>
        </form>

        {/* Список существующих отзывов */}
        <div className="review-list">
          {reviews.length === 0 ? (
            <p className="text-muted text-center py-3">У этого товара пока нет отзывов. Станьте первым!</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold text-dark">{r.username}</span>
                  <span className="text-warning fw-bold">{'⭐'.repeat(r.rating)}</span>
                </div>
                <p className="text-muted mb-0 small" style={{ fontSize: '0.95rem' }}>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
