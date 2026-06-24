package routers

import (
	"net/http"
	"mpv/handlers"
)

// RegisterAuthRoutes — регистрирует открытые маршруты для входа и регистрации
func RegisterAuthRoutes() {
	http.HandleFunc("/api/auth/register", handlers.Register)
	http.HandleFunc("/api/auth/login", handlers.Login)
}
