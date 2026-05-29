package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"mpv/database"
	"mpv/models"
)

// CreateOrder — оформление заказа из корзины фронтенда
func CreateOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

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

	tx := database.DB.Begin()
	var totalPrice float64
	var orderItems []models.OrderItem

	for _, item := range input.Items {
		var product models.Product
		if err := tx.First(&product, item.ProductID).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Товар не найден", http.StatusNotFound)
			return
		}

		if product.Stock < item.Qty {
			tx.Rollback()
			http.Error(w, "Недостаточно товара на складе: "+product.Name, http.StatusBadRequest)
			return
		}

		product.Stock -= item.Qty
		if err := tx.Save(&product).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Ошибка обновления остатков", http.StatusInternalServerError)
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
		http.Error(w, "Ошибка сохранения заказа", http.StatusInternalServerError)
		return
	}

	tx.Commit()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(order)
}

// GetMyOrders — отдает историю заказов текущего пользователя в его профиль
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
	err = database.DB.Preload("Items").Where("user_id = ?", userID).Order("id desc").Find(&orders).Error
	if err != nil {
		http.Error(w, "Ошибка получения истории заказов", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

// GetAllOrders — отдает вообще все заказы на маркетплейсе админу
func GetAllOrders(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	userRole := r.Header.Get("X-User-Role")
	if userRole != "admin" {
		http.Error(w, "Доступ запрещен", http.StatusForbidden)
		return
	}

	var orders []models.Order
	err := database.DB.Preload("Items").Order("id desc").Find(&orders).Error
	if err != nil {
		http.Error(w, "Ошибка получения заказов", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

// UpdateOrderStatus — принудительно меняет статус заказа админом в SQLite базе данных
func UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	userRole := r.Header.Get("X-User-Role")
	if userRole != "admin" {
		http.Error(w, "Доступ запрещен", http.StatusForbidden)
		return
	}

	var input struct {
		OrderID uint   `json:"orderId"`
		Status  string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	// Обновляем конкретную ячейку в SQLite по ID заказа
	result := database.DB.Model(&models.Order{}).Where("id = ?", input.OrderID).Update("status", input.Status)
	if result.Error != nil {
		http.Error(w, "Ошибка обновления статуса", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Статус обновлен"})
}

// DeleteOrder — полностью стирает заказ и его позиции из базы данных SQLite
func DeleteOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	userRole := r.Header.Get("X-User-Role")
	if userRole != "admin" {
		http.Error(w, "Доступ запрещен", http.StatusForbidden)
		return
	}

	orderIDStr := r.URL.Query().Get("id")
	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil || orderID <= 0 {
		http.Error(w, "Некорректный ID заказа", http.StatusBadRequest)
		return
	}

	tx := database.DB.Begin()

	// Сначала очищаем позиции товаров внутри чека
	if err := tx.Where("order_id = ?", orderID).Delete(&models.OrderItem{}).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Ошибка удаления позиций заказа", http.StatusInternalServerError)
		return
	}

	// Затем стираем сам чек заказа
	if err := tx.Delete(&models.Order{}, orderID).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Ошибка удаления заказа", http.StatusInternalServerError)
		return
	}

	tx.Commit()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Заказ успешно удален"})
}
