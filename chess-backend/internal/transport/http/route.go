package http

import (
	"chess-backend/internal/transport/http/middleware"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

func (h *Handler) Routes(r *gin.Engine, authClient *auth.Client) {
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(authClient))
	{
		protected.POST("/login", h.Login)
		//protected.POST("/games", h.CreateGame)
		//protected.POST("/games/:id/finish", h.FinishGame)
		//protected.GET("/games/:id", h.GetGame)
		//protected.GET("/users/:id/games", h.GetUserGames)
		//protected.GET("/leaderboard", h.GetLeaderboard)
	}
}
