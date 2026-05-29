package models

import "gorm.io/gorm"

// Review — структура для хранения отзывов к товарам
type Review struct {
	gorm.Model
	ProductID uint   `gorm:"not null;index" json:"product_id"`
	UserID    uint   `gorm:"not null" json:"user_id"`
	Username  string `json:"username"`
	Rating    int    `gorm:"not null" json:"rating"` // Оценка от 1 до 5
	Comment   string `json:"comment"`
}
