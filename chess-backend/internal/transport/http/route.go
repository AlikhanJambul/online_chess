package http

import (
	"chess-backend/internal/transport/http/middleware"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

func Routes(r *gin.Engine, authClient *auth.Client) {
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(authClient))
	{
	}
}

func Route(r *gin.Engine) {
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})
}
