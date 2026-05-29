package models

import "gorm.io/gorm"

// Favorite — структура для хранения избранных товаров пользователей
type Favorite struct {
	gorm.Model
	UserID    uint    `gorm:"not null;index" json:"user_id"`
	ProductID uint    `gorm:"not null" json:"product_id"`
	Product   Product `gorm:"foreignKey:ProductID" json:"product"` // Автоматически подгрузит данные товара
}
