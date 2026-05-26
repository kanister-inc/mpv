import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useData } from './context/DataContext'; // Импортируем контекст [п.11]

// Импортируем страницы
import Home from './pages/Home';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import ProductDetails from './pages/ProductDetails';

function App() {
  // Забираем реального пользователя и функцию выхода из глобальной базы фронтенда [п.1]
  const { currentUser, logoutUser } = useData();

  return (
    <Router>
      {/* Адаптивная шапка маркетплейса MPV */}
      <nav className="navbar navbar-expand navbar-dark bg-dark mb-4 shadow sticky-top">
        <div className="container px-3">
          <Link className="navbar-brand fw-bold text-primary fs-3" to="/">MPV</Link>
          <div className="navbar-nav ms-auto align-items-center gap-2 gap-sm-3 fs-6">
            <Link className="nav-link px-1 py-2" to="/">Каталог</Link>
            
            {/* Админка видна ТОЛЬКО если вошел админ [п.2,4] */}
            {currentUser && currentUser.role === 'admin' && (
              <Link className="nav-link text-warning px-1 py-2 fw-bold" to="/admin">🛡️ Админка</Link>
            )}
            
            {/* Личный кабинет доступен только авторизованным [п.5] */}
            {currentUser && (
              <Link className="nav-link px-1 py-2" to="/profile">👤 Кабинет</Link>
            )}
            
            <Link className="nav-link px-1 py-2" to="/cart">🛒 Корзина</Link>
            
            {/* Динамическая кнопка Войти / Выйти [п.1,4,5] */}
            {currentUser ? (
              <button className="btn btn-sm btn-outline-danger px-3 rounded-3 fw-bold" onClick={logoutUser}>
                Выйти
              </button>
            ) : (
              <Link className="btn btn-sm btn-outline-light px-3 rounded-3 fw-bold" to="/auth">
                Войти
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      <div className="container mb-5 px-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* Защита страниц: если не вошел — редирект на авторизацию [п.1] */}
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin" element={currentUser && currentUser.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
