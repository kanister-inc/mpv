package models

import "gorm.io/gorm" // 👈 Проверь, чтобы этот импорт обязательно был!

// Order — общая информация о заказе
type Order struct {
	gorm.Model
	UserID     uint        `gorm:"not null" json:"user_id"`
	TotalPrice float64     `gorm:"not null" json:"total_price"`
	Status     string      `gorm:"default:'pending'" json:"status"`
	Items      []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
}

// OrderItem — конкретный товар внутри заказа
type OrderItem struct {
	gorm.Model
	OrderID   uint    `gorm:"not null" json:"order_id"`
	ProductID uint    `gorm:"not null" json:"product_id"`
	Price     float64 `gorm:"not null" json:"price"`
	Quantity  int     `gorm:"not null" json:"quantity"`
}
