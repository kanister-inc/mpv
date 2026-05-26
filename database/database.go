package database

import (
	"mpv/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Глобальная переменная для работы с базой во всем проекте
var DB *gorm.DB

func ConnectAndMigrate() {
	var err error
	
	// Подключаемся к локальной базе данных shop.db
	DB, err = gorm.Open(sqlite.Open("shop.db"), &gorm.Config{})
	if err != nil {
		panic("Не удалось подключиться к базе данных: " + err.Error())
	}

	// Создаем таблицы на основе структуры ваших моделей
	DB.AutoMigrate(&models.User{}, &models.Product{}, &models.Cart{}, &models.Order{})
}
