package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"mpv/database"
	"mpv/models"
)

// CreateOrder — ручка для оформления заказа из корзины фронтенда
func CreateOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	// Читаем ID пользователя из заголовков фронтенда
	userIDStr := r.Header.Get("X-User-Id")
	if userIDStr == "" {
		http.Error(w, "Пользователь не авторизован", http.StatusUnauthorized)
		return
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		http.Error(w, "Некорректный ID пользователя", http.StatusBadRequest)
		return
	}

	// Структура для разбора входящей корзины из React
	var input struct {
		Items []struct {
			ProductID uint    `json:"productId"`
			Price     float64 `json:"price"`
			Qty       int     `json:"qty"`
		} `json:"items"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON запроса", http.StatusBadRequest)
		return
	}

	if len(input.Items) == 0 {
		http.Error(w, "Корзина пуста", http.StatusBadRequest)
		return
	}

	// Открываем транзакцию в базе данных
	tx := database.DB.Begin()

	var totalPrice float64
	var orderItems []models.OrderItem

	// Проверяем склад маркетплейса
	for _, item := range input.Items {
		var product models.Product
		if err := tx.First(&product, item.ProductID).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Товар не найден в базе данных", http.StatusNotFound)
			return
		}

		// Валидация остатков товара у продавца
		if product.Stock < item.Qty {
			tx.Rollback()
			http.Error(w, "Недостаточно товара на складе: "+product.Name, http.StatusBadRequest)
			return
		}

		// Вычитаем купленное количество со склада
		product.Stock -= item.Qty
		if err := tx.Save(&product).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Ошибка обновления остатков на складе", http.StatusInternalServerError)
			return
		}

		totalPrice += product.Price * float64(item.Qty)

		orderItems = append(orderItems, models.OrderItem{
			ProductID: product.ID,
			Price:     product.Price,
			Quantity:  item.Qty,
		})
	}

	order := models.Order{
		UserID:     uint(userID),
		TotalPrice: totalPrice,
		Status:     "pending",
		Items:      orderItems,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Ошибка сохранения заказа в базу данных", http.StatusInternalServerError)
		return
	}

	tx.Commit()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(order)
}

// GetMyOrders — отдает список всех заказов конкретного залогиненного пользователя
func GetMyOrders(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	userIDStr := r.Header.Get("X-User-Id")
	if userIDStr == "" {
		http.Error(w, "Пользователь не авторизован", http.StatusUnauthorized)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Некорректный ID", http.StatusBadRequest)
		return
	}

	var orders []models.Order
	// Достаем из SQLite историю покупок текущего юзера вместе с составом
	err = database.DB.Preload("Items").Where("user_id = ?", userID).Order("id desc").Find(&orders).Error
	if err != nil {
		http.Error(w, "Ошибка получения истории заказов", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

// GetAllOrders — отдает список ВЕХ заказов на платформе (только для админа)
func GetAllOrders(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	userRole := r.Header.Get("X-User-Role")
	if userRole != "admin" {
		http.Error(w, "Доступ запрещен. Требуются права администратора", http.StatusForbidden)
		return
	}

	var orders []models.Order
	// Вытаскиваем абсолютно все заказы маркетплейса для вкладки управления
	err := database.DB.Preload("Items").Order("id desc").Find(&orders).Error
	if err != nil {
		http.Error(w, "Ошибка получения списка заказов", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

// UpdateOrderStatus — меняет статус заказа (только для админа)
func UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	// Защита: проверяем роль из CORS-заголовка фронтенда
	userRole := r.Header.Get("X-User-Role")
	if userRole != "admin" {
		http.Error(w, "Доступ запрещен. Требуются права администратора", http.StatusForbidden)
		return
	}

	// Структура для чтения тела запроса
	var input struct {
		OrderID uint   `json:"orderId"`
		Status  string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	// Ищем заказ в SQLite
	var order models.Order
	if err := database.DB.First(&order, input.OrderID).Error; err != nil {
		http.Error(w, "Заказ не найден", http.StatusNotFound)
		return
	}

	// Обновляем статус
	order.Status = input.Status
	if err := database.DB.Save(&order).Error; err != nil {
		http.Error(w, "Ошибка обновления статуса заказа", http.StatusInternalServerError)
		return
	}

	// Возвращаем успешный ответ
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Статус заказа успешно обновлен!"})
}
