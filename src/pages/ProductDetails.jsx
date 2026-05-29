import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

function ProductDetails() {
  const { id } = useParams();
  const { products, addToCart, toggleFavorite, favorites, currentUser } = useData();

  const product = products.find(p => p.id === parseInt(id));

  // 💬 ТЕПЕРЬ ЖИВЫЕ ОТЗЫВЫ: изначально массив пустой, данные тянем с бэка
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const isFavorite = favorites.includes(product?.id);

  // Загружаем отзывы для этого конкретного товара с Go-сервера
  useEffect(() => {
    if (!product) return;

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/reviews?productId=${product.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data || []); // Сохраняем отзывы из базы в стейт
        }
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
      }
    };

    fetchReviews();
  }, [product]);

  if (!product) {
    return (
      <div className="text-center p-5">
        <h3>Товар не найден 🔍</h3>
        <Link to="/" className="btn btn-primary mt-3">Назад в каталог</Link>
      </div>
    );
  }

  // Обработка отправки отзыва на бэкенд в SQLite
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Пожалуйста, войдите в аккаунт, чтобы оставить отзыв!');
      return;
    }
    if (!comment.trim()) return;

    try {
      const response = await fetch('http://localhost:8080/api/reviews/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUser.id),
          'X-User-Role': currentUser.role
        },
        body: JSON.stringify({
          productId: product.id,
          username: currentUser.name || 'Покупатель',
          rating: rating,
          comment: comment
        })
      });

      if (response.ok) {
        const newReview = await response.json();
        // Добавляем новый отзыв в начало списка, чтобы он сразу отобразился
        setReviews([newReview, ...reviews]);
        setComment('');
        setRating(5);
        alert('Отзыв успешно опубликован!');
      } else {
        alert('Не удалось сохранить отзыв на сервере.');
      }
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      alert('Ошибка сети: бэкенд недоступен.');
    }
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
              <button 
                className={`btn btn-lg px-5 fw-bold ${product.stock > 0 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => addToCart(product.id)}
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? 'В корзину' : 'Закончился'}
              </button>

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

      {/* 💬 Блок отзывов */}
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

        {/* Список отзывов из базы SQLite */}
        <div className="review-list">
          {reviews.length === 0 ? (
            <p className="text-muted text-center py-3">У этого товара пока нет отзывов. Станьте первым!</p>
          ) : (
            reviews.map(r => (
              <div key={r.ID || r.id} className="border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold text-dark">{r.username || r.Username}</span>
                  <span className="text-warning fw-bold">{'⭐'.repeat(r.rating || r.Rating)}</span>
                </div>
                <p className="text-muted mb-0 small" style={{ fontSize: '0.95rem' }}>{r.comment || r.Comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
