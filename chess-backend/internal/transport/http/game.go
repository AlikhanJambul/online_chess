package http

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) CreateGame(c *gin.Context) {
	uid := c.GetString("uid")

	game, err := h.gameService.CreateGame(c.Request.Context(), uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, game)
}

func (h *Handler) JoinGame(c *gin.Context) {
	uid := c.GetString("uid")
	gameID := c.Param("id")

	game, err := h.gameService.JoinGame(c.Request.Context(), gameID, uid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, game)
}

func (h *Handler) FinishGame(c *gin.Context) {
	uid := c.GetString("uid")
	gameID := c.Param("id")

	var body struct {
		WinnerID string `json:"winner_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "winner_id required"})
		return
	}

	// только участник партии может завершить
	game, err := h.gameService.GetGame(c.Request.Context(), gameID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
		return
	}

	if game.WhiteID != uid && (game.BlackID == nil || *game.BlackID != uid) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not your game"})
		return
	}

	if err := h.gameService.FinishGame(c.Request.Context(), gameID, body.WinnerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "game finished"})
}

func (h *Handler) GetGame(c *gin.Context) {
	gameID := c.Param("id")

	game, err := h.gameService.GetGame(c.Request.Context(), gameID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
		return
	}

	c.JSON(http.StatusOK, game)
}

func (h *Handler) GetUserGames(c *gin.Context) {
	userID := c.Param("id")

	games, err := h.gameService.GetUserGames(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, games)
}

func (h *Handler) GetLeaderboard(c *gin.Context) {
	entries, err := h.gameService.GetLeaderboard(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entries)
}
