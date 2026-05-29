package models

import "gorm.io/gorm"

// Product — структура товара в магазине
type Product struct {
	gorm.Model
	Name        string  `gorm:"not null" json:"name"`
	Description string  `json:"description"`
	Price       float64 `gorm:"not null" json:"price"`
	Category    string  `gorm:"not null" json:"category"`
	Img         string  `json:"img"`
	Stock       int     `gorm:"default:0" json:"stock"` // 📦 Количество на складе
	SellerID    uint    `json:"seller_id"`              // 👤 ID продавца, создавшего товар
}
