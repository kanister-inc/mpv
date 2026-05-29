import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

const API_URL = 'http://localhost:8080'; 

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👤 НОВОЕ: Инициализируем currentUser из localStorage, чтобы сессия не сбрасывалась при F5
  const [currentUser, setCurrentUser] = useState(() => {
    const savedId = localStorage.getItem('userId');
    const savedRole = localStorage.getItem('userRole');
    const savedName = localStorage.getItem('userName'); // Добавим сохранение имени
    const savedEmail = localStorage.getItem('userEmail');

    if (savedId && savedRole) {
      return { id: parseInt(savedId), role: savedRole, name: savedName || 'Администратор', email: savedEmail || '' };
    }
    return null;
  });

  // Загружаем данные профиля и избранного при первой загрузке, если сессия жива
  useEffect(() => {
    if (currentUser) {
      fetchUserFavorites(currentUser.id);
    }
  }, []);

  // 1. Загрузка товаров с учетом количества на складе и ID продавца
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          
          const normalizedProducts = data.map(p => ({
            id: p.ID || p.id,            
            name: p.name,
            price: p.price,
            category: p.category,
            img: p.img,
            desc: p.description,
            stock: p.stock ?? 0,         // Количество на складе
            sellerId: p.seller_id || 0   // ID продавца
          }));
          setProducts(normalizedProducts);
        } else {
          console.error('Ошибка при загрузке товаров с сервера');
        }
      } catch (error) {
        console.error('Не удалось соединиться с бэкендом:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 2. Регистрация пользователя или продавца
  const registerUser = async (name, email, password, role = 'customer') => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: name,
          email, 
          password,
          role: role 
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message || 'Регистрация успешна! Теперь вы можете войти.' };
      } else {
        return { success: false, message: data.message || 'Пользователь с таким Email или Логином уже существует' };
      }
    } catch (error) {
      return { success: false, message: 'Нет связи с сервером.' };
    }
  };
  // 3. Авторизация 
  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json(); 
        
        const user = {
          id: data.id,
          name: data.username,
          email: data.email,
          role: data.role // "customer", "seller" или "admin"
        };

        setCurrentUser(user); 
        
        // 🔒 Расширяем localStorage, чтобы сессия не сбрасывалась при F5
        localStorage.setItem('userId', String(user.id));
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);    // Запоминаем имя для профиля
        localStorage.setItem('userEmail', user.email);  // Запоминаем почту для профиля
        
        // Подтягиваем лайки из SQLite базы данных
        fetchUserFavorites(user.id);
        
        return { success: true };
      } else {
        return { success: false, message: 'Неверный Email или пароль' };
      }
    } catch (error) {
      return { success: false, message: 'Ошибка сети или сервер недоступен.' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCart([]); 
    setOrders([]);
    setFavorites([]);
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  };

  // 4. Создание товара продавца/админа в SQLite через Go
  const createProduct = async (productData) => {
    if (!currentUser || (currentUser.role !== 'seller' && currentUser.role !== 'admin')) {
      return { success: false, message: 'Недостаточно прав для добавления товара.' };
    }

    const fullProductData = {
      name: productData.name,
      description: productData.desc, 
      price: parseFloat(productData.price),
      category: productData.category,
      img: productData.img || '/images/default.jpg',
      stock: parseInt(productData.stock) || 0, 
      seller_id: currentUser.id 
    };

    try {
      const response = await fetch(`${API_URL}/api/products/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUser.id),
          'X-User-Role': currentUser.role
        },
        body: JSON.stringify(fullProductData)
      });

      if (response.ok) {
        const savedProduct = await response.json();
        const normalizedNewProduct = {
          id: savedProduct.ID,
          name: savedProduct.name,
          price: savedProduct.price,
          category: savedProduct.category,
          img: savedProduct.img,
          desc: savedProduct.description,
          stock: savedProduct.stock || 0,
          sellerId: savedProduct.seller_id
        };

        setProducts(prevProducts => [...prevProducts, normalizedNewProduct]);
        return { success: true, message: 'Товар успешно добавлен на склад!' };
      } else {
        return { success: false, message: 'Не удалось сохранить товар на сервере.' };
      }
    } catch (error) {
      return { success: false, message: 'Ошибка сети при создании товара.' };
    }
  };

  // 5. Удаление товара из SQLite через Go
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/products/delete?id=${productId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': String(currentUser?.id || ''),
          'X-User-Role': currentUser?.role || ''
        }
      });

      if (response.ok) {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        return { success: true };
      } else {
        return { success: false, message: 'Ошибка удаления на сервере.' };
      }
    } catch (error) {
      return { success: false, message: 'Ошибка сети.' };
    }
  };
  // 6. Функции корзины с проверкой наличия товара на складе
  const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === productId);
      
      const currentQty = existingItem ? existingItem.qty : 0;
      if (currentQty >= product.stock) {
        alert(`Нельзя добавить больше! На складе осталось всего: ${product.stock} шт.`);
        return prevCart;
      }

      if (existingItem) {
        return prevCart.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item);
      }
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

  // ⭐ НОВОЕ: Загрузка сохраненных лайков из SQLite при входе на сайт
  const fetchUserFavorites = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: {
          'X-User-Id': String(userId),
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data || []); 
      }
    } catch (error) {
      console.error('Не удалось загрузить избранное:', error);
    }
  };

  // ⭐ НОВОЕ: Живое переключение лайков через Go бэкенд
  const toggleFavorite = async (productId) => {
    if (!currentUser) {
      alert('Пожалуйста, авторизуйтесь для добавления в избранное!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUser.id)
        },
        body: JSON.stringify({ productId: Number(productId) })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'added') {
          setFavorites(prev => [...prev, productId]);
        } else if (data.status === 'removed') {
          setFavorites(prev => prev.filter(id => id !== productId));
        }
      } else {
        alert('Не удалось обновить статус избранного.');
      }
    } catch (error) {
      console.error('Ошибка сети при переключении избранного:', error);
    }
  };

  const createOrder = () => {
    if (!currentUser) return;
    setCart([]);
    return { success: true };
  };

  return (
    <DataContext.Provider value={{ 
      products, setProducts, cart, currentUser, orders, favorites, loading, setOrders,
      registerUser, loginUser, logoutUser, createProduct, deleteProduct, toggleFavorite,
      addToCart, removeFromCartOne, removeFromCart, createOrder
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
