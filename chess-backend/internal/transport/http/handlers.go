package http

import (
	"chess-backend/internal/app/usecase"
	"github.com/gin-gonic/gin"
	"net/http"
)

type Handler struct {
	service usecase.Service
}

func NewHandler(service usecase.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Login(c *gin.Context) {
	uid := c.GetString("uid")
	user, err := h.service.LoginOrCreate(c.Request.Context(), uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}
