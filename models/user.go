package models

import "gorm.io/gorm"

// User — структура пользователя в базе данных
type User struct {
	gorm.Model        // Автоматически добавляет ID, CreatedAt, UpdatedAt, DeletedAt
	Username   string `gorm:"unique;not null" json:"username"`
	Email      string `gorm:"unique;not null" json:"email"`
	Password   string `gorm:"not null" json:"-"` // json:"-" скрывает пароль при отправке на фронтенд
	Role       string `gorm:"default:'customer'" json:"role"` // customer, seller, admin
}
