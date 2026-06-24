package routers

import (
	"mpv/handlers"
	"net/http"
)

// RegisterUserRoutes — регистрирует маршруты для обычных пользователей и их заказов
func RegisterUserRoutes() {
	// Эндпоинт создания заказа, куда будет стучаться фронтенд
	http.HandleFunc("/api/orders", handlers.CreateOrder)

	// Старый проверочный роут
	http.HandleFunc("/api/user/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("User router works!"))
	})
	// ⭐ Маршруты для Избранного (Favorites)
	http.HandleFunc("/api/favorites/toggle", handlers.ToggleFavorite)
	http.HandleFunc("/api/favorites", handlers.GetUserFavorites)
	http.HandleFunc("/api/reviews", handlers.GetProductReviews)
	http.HandleFunc("/api/reviews/add", handlers.AddReview)

}
