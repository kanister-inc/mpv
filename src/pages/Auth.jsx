import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function Auth() {
  const { registerUser, loginUser } = useData();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('customer'); // По умолчанию — обычный покупатель
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Состояние отправки запроса

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Логика Входа (теперь асинхронная)
        const res = await loginUser(email, password);
        if (res.success) {
          navigate('/'); // Перенаправляем на главную страницу
        } else {
          setError(res.message);
        }
      } else {
        // Логика Регистрации (передаем выбранную роль на Go)
        const res = await registerUser(fullName, email, password, role);
        alert(res.message);
        if (res.success) {
          setIsLogin(true); // Переключаем на экран входа
          setFullName('');
          setPassword('');
          setRole('customer'); // Сбрасываем роль на дефолтную
        }
      }
    } catch (err) {
      setError('Произошла непредвиденная ошибка при связи с сервером.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center mx-0 px-2" style={{ minHeight: '70vh' }}>
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div className="card p-4 shadow-sm border-0 rounded-3 bg-white">
          <h3 className="text-center fw-bold mb-4">{isLogin ? 'Вход в MPV' : 'Регистрация'}</h3>
          
          {error && <div className="alert alert-danger py-2 small text-center rounded-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Ваше имя</label>
                  <input type="text" className="form-control rounded-3" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>

                {/* 🎭 Выбор роли: Покупатель или Продавец */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted d-block">Тип аккаунта</label>
                  <div className="btn-group w-100" role="group">
                    <input type="radio" className="btn-check" name="roleRadio" id="customerRadio" checked={role === 'customer'} onChange={() => setRole('customer')} />
                    <label className="btn btn-outline-primary py-2 small fw-bold" htmlFor="customerRadio">🛍️ Покупатель</label>

                    <input type="radio" className="btn-check" name="roleRadio" id="sellerRadio" checked={role === 'seller'} onChange={() => setRole('seller')} />
                    <label className="btn btn-outline-primary py-2 small fw-bold" htmlFor="sellerRadio">💼 Продавец</label>
                  </div>
                </div>
              </>
            )}
            
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Email адрес</label>
              <input type="email" className="form-control rounded-3" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Пароль</label>
              <input type="password" className="form-control rounded-3" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            
            <button type="submit" disabled={loading} className="btn btn-primary w-100 py-2 fw-bold mb-3 rounded-3 shadow-sm">
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
            </button>
            
            <div className="text-center">
              <button type="button" className="btn btn-link text-decoration-none small text-primary p-0" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Auth;
