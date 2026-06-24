package database

import (
	"fmt"
	"mpv/models" // Подключаем наши модели (убедись, что имя модуля в go.mod — mpv)

	// Используем чистый SQLite драйвер без CGO, который прописан в твоем go.mod
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

// DB — глобальная переменная для работы с базой данных из любого места бэкенда
var DB *gorm.DB

// ConnectAndMigrate — инициализирует shop.db и создает/обновляет все таблицы
func ConnectAndMigrate() {
	var err error

	// 1. Подключаемся к файлу базы данных SQLite
	DB, err = gorm.Open(sqlite.Open("shop.db"), &gorm.Config{})
	if err != nil {
		panic("Не удалось подключиться к базе данных SQLite: " + err.Error())
	}

	fmt.Println("📦 База данных shop.db успешно подключена!")

	// 2. АВТОМИГРАЦИЯ: GORM автоматически создаст или обновит таблицы в SQLite под наши структуры
	err = DB.AutoMigrate(
		&models.User{},      // Таблица пользователей
		&models.Product{},   // Таблица товаров (теперь с полями stock и seller_id)
		&models.Order{},     // Таблица общей информации о заказах
		&models.OrderItem{}, // Таблица конкретных товаров внутри заказа
		&models.Review{},    // Таблица отзывов и оценок
		&models.Favorite{},  // Таблица избранных товаров
	)

	if err != nil {
		panic("Ошибка при автоматической миграции таблиц: " + err.Error())
	}

	fmt.Println("🚀 Все таблицы базы данных успешно синхронизированы!")
}
