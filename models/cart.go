package models

import "gorm.io/gorm"

// CartItem — элемент корзины (какой товар и сколько штук)
type CartItem struct {
	gorm.Model
	UserID    uint    `gorm:"not null" json:"user_id"`    // Связь с пользователем
	ProductID uint    `gorm:"not null" json:"product_id"` // Связь с товаром
	Product   Product `gorm:"foreignKey:ProductID" json:"product"` // Подгрузит данные товара автоматически
	Quantity  int     `gorm:"default:1" json:"quantity"`  // Количество товара
}
