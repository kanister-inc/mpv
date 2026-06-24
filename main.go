package main

import (
	"fmt"
	"mpv/database"
	"mpv/routers"
	"net/http"
)

// Middleware для настройки CORS (чтобы React мог делать запросы к Go)
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-User-Id, X-User-Role")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// 1. Инициализируем базу данных shop.db и создаем таблицы
	database.ConnectAndMigrate()

	// 2. Регистрируем все наши маршруты из папки routers
	routers.RegisterAuthRoutes()
	routers.RegisterAdminRoutes()
	routers.RegisterUserRoutes()

	// Базовый роут для проверки работоспособности сервера
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Привет! Бэкенд маркетплейса MPV успешно запущен!"))
	})

	// 3. Оборачиваем все роуты в CORS-защиту
	mainRouter := http.DefaultServeMux
	handlerWithCORS := enableCORS(mainRouter)

	// 4. Запускаем сервер на порту 8080
	fmt.Println("🚀 Сервер бэкенда стартовал на http://127.0.0.1:8080")
	err := http.ListenAndServe(":8080", handlerWithCORS)
	if err != nil {
		panic("Не удалось запустить сервер: " + err.Error())
	}
}
