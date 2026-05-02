package game

import (
	"chess-backend/internal/domain/ports"
)

type GameService interface {
}

type gameService struct {
	repo ports.Repository
}

func NewGameService(repo ports.Repository) GameService {
	return &gameService{repo: repo}
}
