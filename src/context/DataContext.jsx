import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // База товаров
  const [products, setProducts] = useState([
    { id: 1, name: 'Смартфон MPV Ultra', price: 69990, category: 'electronics', img: '/images/phone.jpg', desc: 'Флагманский смартфон с потрясающей камерой и мощным процессором.' },
    { id: 2, name: 'Худи OVERSIZE Черный', price: 3500, category: 'clothes', img: '/images/hoodie.jpg', desc: 'Стильное и комфортное худи свободного кроя из качественного плотного хлопка.' },
    { id: 3, name: 'Беспроводные наушники Pods Pro', price: 12990, category: 'electronics', img: '/images/headphones.jpg', desc: 'Наушники с активным шумоподавлением и кристально чистым звуком.' },
    { id: 4, name: 'Кроссовки Спортивные', price: 7800, category: 'clothes', img: '/images/shoes.jpg', desc: 'Легкие и дышащие кроссовки для бега и повседневной ходьбы.' },
    { id: 5, name: 'Умные часы MPV Watch', price: 21990, category: 'electronics', img: '/images/watch.jpg', desc: 'Мониторинг пульса, сна, уровня кислорода в крови и встроенный GPS.' },
  ]);

  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // 📜 НОВОЕ: Глобальный массив ВСЕХ заказов на платформе [п.5,7]
  const [orders, setOrders] = useState([]);

  const [users, setUsers] = useState([
    { id: 1, name: 'Администратор', email: 'admin@mpv.ru', password: 'admin', role: 'admin' },
    { id: 2, name: 'Иван Покупатель', email: 'user@mpv.ru', password: 'user', role: 'user' }
  ]);

  const registerUser = (name, email, password) => {
    const exists = users.find(u => u.email === email);
    if (exists) return { success: false, message: 'Пользователь с таким email уже есть!' };
    const newUser = { id: Date.now(), name, email, password, role: 'user' };
    setUsers([...users, newUser]);
    return { success: true, message: 'Регистрация успешна! Теперь вы можете войти.' };
  };

  const loginUser = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'Неверный email или пароль!' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCart([]); 
  };

  // 📦 НОВОЕ: Функция создания заказа. Привязывает ID юзера, дату и все товары из корзины [п.5]
  const createOrder = () => {
    if (!currentUser) return;

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Генерируем случайный UUID-подобный ID заказа, чтобы админ мог искать по последним 4 знакам [п.7]
    const orderId = Math.random().toString(16).substring(2, 10); 

    const newOrder = {
      id: orderId,
      userId: currentUser.id, // Привязка к аккаунту [п.5]
      date: new Date().toLocaleDateString('ru-RU'),
      total: totalPrice,
      status: 'Новый', // Дефолтный статус для админки [п.7]
      // Содержание заказа: копируем текущий срез корзины [п.5]
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty
      }))
    };

    setOrders([newOrder, ...orders]);
    setCart([]); // Очищаем корзину ПОСЛЕ успешного оформления [п.5]
  };

  // Функции корзины
  const addToCart = (productId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item);
      }
      const product = products.find(p => p.id === productId);
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const removeFromCartOne = (productId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.qty > 1) {
        return prevCart.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item);
      }
      return prevCart.filter(item => item.id !== productId);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  return (
    <DataContext.Provider value={{ 
      products, cart, users, setUsers, currentUser, orders, setOrders,
      registerUser, loginUser, logoutUser, createOrder,
      addToCart, removeFromCartOne, removeFromCart 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
