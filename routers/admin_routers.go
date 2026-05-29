package routers

import (
	"mpv/handlers"
	"net/http"
)

func RegisterAdminRoutes() {
	// Твои существующие роуты товаров
	http.HandleFunc("/api/products", handlers.GetProducts)
	http.HandleFunc("/api/products/create", handlers.CreateProduct)
	http.HandleFunc("/api/products/update", handlers.UpdateProduct)
	http.HandleFunc("/api/products/delete", handlers.DeleteProduct)

	// Роут для просмотра всех заказов админом
	http.HandleFunc("/api/admin/orders", handlers.GetAllOrders)

	// 🛠️ ДОБАВЛЯЕМ СЮДА ЭТУ СТРОЧКУ, ЧТОБЫ СВЯЗАТЬ ФРОНТЕНД С БЭКЕНДОМ
	http.HandleFunc("/api/admin/orders/update", handlers.UpdateOrderStatus)
	http.HandleFunc("/api/admin/orders/delete", handlers.DeleteOrder)

}
