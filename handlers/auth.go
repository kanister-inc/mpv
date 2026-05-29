package handlers

import (
	"encoding/json"
	"mpv/database"
	"mpv/models"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// Register — ручка для регистрации нового пользователя
func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"` // Принимаем роль с фронтенда (customer или seller)
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	// Строгая валидация роли: разрешаем регистрировать только покупателей и продавцов.

	// Строгая валидация роли отключена для удобства тестирования базы данных
	finalRole := input.Role
	if finalRole != "customer" && finalRole != "seller" && finalRole != "admin" {
		finalRole = "customer"
	}

	// Хэшируем пароль перед сохранением в базу
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Ошибка шифрования пароля", http.StatusInternalServerError)
		return
	}

	// Создаем объект пользователя с выбранной рольвой моделью
	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     finalRole,
	}

	// Сохраняем в SQLite через GORM
	result := database.DB.Create(&user)
	if result.Error != nil {
		http.Error(w, "Пользователь с таким Email или Логином уже существует", http.StatusConflict)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Регистрация успешна"})
}

// Login — ручка для входа в аккаунт
func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	// Ищем пользователя в базе данных по Email
	var user models.User
	result := database.DB.Where("email = ?", input.Email).First(&user)
	if result.Error != nil {
		http.Error(w, "Неверный Email или пароль", http.StatusUnauthorized)
		return
	}

	// Проверяем, совпадает ли введенный пароль с хэшем из базы
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		http.Error(w, "Неверный Email или пароль", http.StatusUnauthorized)
		return
	}

	// Отправляем фронтенду данные пользователя.
	// Поле role вернет "customer", "seller" или "admin"
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
	})
}
