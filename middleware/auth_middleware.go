package middleware

import (
	"net/http"
)

// AuthRequired — проверяет, передал ли фронтенд ID пользователя (авторизован ли он)
func AuthRequired(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Header.Get("X-User-Id")
		
		// Если ID пользователя не передан, закрываем доступ
		if userID == "" {
			http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
			return
		}

		// Если всё хорошо, передаем запрос дальше по цепочке
		next(w, r)
	}
}
