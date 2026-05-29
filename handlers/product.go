package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"mpv/database"
	"mpv/models"
)

// GetProducts — отдает все товары (доступно всем без авторизации)
func GetProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	var products []models.Product
	// Забираем все товары из базы данных
	database.DB.Find(&products)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

// CreateProduct — создает новый товар (только для админа/продавца)
// CreateProduct — создает новый товар (только для админа/продавца)
func CreateProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	// 👤 Получаем ID пользователя из заголовков запроса, которые пришлет React
	userIDStr := r.Header.Get("X-User-Id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil || userID <= 0 {
		http.Error(w, "Пользователь не авторизован или неверный ID", http.StatusUnauthorized)
		return
	}

	var product models.Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	// 🔒 Принудительно привязываем товар к текущему продавцу
	product.SellerID = uint(userID)

	// Сохраняем в базу данных
	if err := database.DB.Create(&product).Error; err != nil {
		http.Error(w, "Ошибка сохранения товара", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// UpdateProduct — редактирует существующий товар (только для админа/продавца)
func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	// Достаем ID товара из URL (например, /api/products/update?id=1)
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		http.Error(w, "Некорректный ID товара", http.StatusBadRequest)
		return
	}

	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		http.Error(w, "Товар не найден", http.StatusNotFound)
		return
	}

	// Читаем новые данные из запроса
	var input models.Product
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	// Обновляем поля
	product.Name = input.Name
	product.Description = input.Description
	product.Price = input.Price
	product.Category = input.Category
	product.Img = input.Img

	database.DB.Save(&product)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// DeleteProduct — удаляет товар из базы данных (только для админа/продавца)
func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		http.Error(w, "Некорректный ID товара", http.StatusBadRequest)
		return
	}

	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		http.Error(w, "Товар не найден", http.StatusNotFound)
		return
	}

	// Жесткое удаление из базы данных
	database.DB.Unscoped().Delete(&product)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Товар успешно удален"})
}

// AddReview — ручка для отправки отзыва (комментарий + оценка) покупателем
func AddReview(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	userIDStr := r.Header.Get("X-User-Id")
	if userIDStr == "" {
		http.Error(w, "Авторизуйтесь, чтобы оставить отзыв", http.StatusUnauthorized)
		return
	}

	userIDInt, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Некорректный ID пользователя", http.StatusBadRequest)
		return
	}
	userID := uint(userIDInt)

	var input struct {
		ProductID uint   `json:"productId"`
		Username  string `json:"username"`
		Rating    int    `json:"rating"`
		Comment   string `json:"comment"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	var review models.Review
	review.ProductID = input.ProductID
	review.UserID = userID
	review.Username = input.Username
	review.Rating = input.Rating
	review.Comment = input.Comment

	if err := database.DB.Create(&review).Error; err != nil {
		http.Error(w, "Ошибка сохранения отзыва", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(review)
}

// GetProductReviews — загружает все отзывы для конкретного товара по его ID
func GetProductReviews(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	productIDStr := r.URL.Query().Get("productId")
	productID, err := strconv.Atoi(productIDStr)
	if err != nil || productID <= 0 {
		http.Error(w, "Некорректный ID товара", http.StatusBadRequest)
		return
	}

	var reviews []models.Review
	database.DB.Where("product_id = ?", productID).Order("id desc").Find(&reviews)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reviews)
}

// ToggleFavorite — добавляет товар в избранное или удаляет его, если он уже там
func ToggleFavorite(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	userIDStr := r.Header.Get("X-User-Id")
	if userIDStr == "" {
		http.Error(w, "Авторизуйтесь, чтобы добавить в избранное", http.StatusUnauthorized)
		return
	}
	userIDInt, _ := strconv.Atoi(userIDStr)
	userID := uint(userIDInt)

	var input struct {
		ProductID uint `json:"productId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	var fav models.Favorite
	// Ищем, есть ли уже этот товар в избранном у этого юзера
	result := database.DB.Where("user_id = ? AND product_id = ?", userID, input.ProductID).First(&fav)

	if result.Error == nil {
		// Если нашли — удаляем («убираем лайк»)
		database.DB.Delete(&fav)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"status": "removed", "productId": input.ProductID})
	} else {
		// Если не нашли — создаем («ставим лайк»)
		newFav := models.Favorite{
			UserID:    userID,
			ProductID: input.ProductID,
		}
		database.DB.Create(&newFav)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"status": "added", "productId": input.ProductID})
	}
}

// GetUserFavorites — возвращает массив ID всех избранных товаров текущего пользователя
func GetUserFavorites(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	userIDStr := r.Header.Get("X-User-Id")
	if userIDStr == "" {
		http.Error(w, "Пользователь не авторизован", http.StatusUnauthorized)
		return
	}
	userIDInt, _ := strconv.Atoi(userIDStr)
	userID := uint(userIDInt)

	var favorites []models.Favorite
	database.DB.Where("user_id = ?", userID).Find(&favorites)

	// Собираем только массив ID товаров для удобства фронтенда [1, 3, 5...]
	var productIDs []uint
	for _, f := range favorites {
		productIDs = append(productIDs, f.ProductID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(productIDs)
}
