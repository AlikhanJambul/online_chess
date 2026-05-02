package http

import (
	"chess-backend/internal/app/usecase/auth"
	"chess-backend/internal/app/usecase/game"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	authService auth.AuthService
	gameService game.GameService
}

func NewHandler(authService auth.AuthService, gameService game.GameService) *Handler {
	return &Handler{authService: authService, gameService: gameService}
}

func (h *Handler) Login(c *gin.Context) {
	uid := c.GetString("uid")
	user, err := h.authService.LoginOrCreate(c.Request.Context(), uid)
	if err != nil {
		slog.Error(err.Error())

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}
