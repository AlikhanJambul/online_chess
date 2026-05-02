package http

import (
	"chess-backend/internal/transport/http/middleware"
	"chess-backend/internal/transport/ws"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) Routes(r *gin.Engine, authClient *auth.Client, hub *ws.Hub) {
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	wsHandler := ws.NewWSHandler(hub, authClient)
	r.GET("/ws/games/:id", wsHandler.HandleConnection)

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(authClient))
	{
		protected.POST("/login", h.Login)

		protected.POST("/games", h.CreateGame)
		protected.POST("/games/:id/join", h.JoinGame)
		protected.POST("/games/:id/finish", h.FinishGame)
		protected.GET("/games/:id", h.GetGame)

		protected.GET("/users/:id/games", h.GetUserGames)
		protected.GET("/leaderboard", h.GetLeaderboard)

		//protected.POST("/test/games", func(c *gin.Context) {
		//	game, err := h.gameService.CreateGame(c.Request.Context(), "test-user-123")
		//	if err != nil {
		//		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		//		return
		//	}
		//	c.JSON(http.StatusCreated, game)
		//})
	}
}
