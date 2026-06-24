package middleware

import (
	"net/http"
)

// AdminOrSellerRequired — проверяет, является ли пользователь админом или продавцом
func AdminOrSellerRequired(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role := r.Header.Get("X-User-Role")

		// Проверяем роль. Если не админ и не продавец — блокируем
		if role != "admin" && role != "seller" {
			http.Error(w, "Доступ запрещен: недостаточно прав", http.StatusForbidden)
			return
		}

		// Если роль подходит, разрешаем действие
		next(w, r)
	}
}
