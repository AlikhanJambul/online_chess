package game

import (
	"chess-backend/internal/domain/models"
	"chess-backend/internal/domain/ports"
	"context"
	"fmt"
)

type GameService interface {
	CreateGame(ctx context.Context, whiteID string) (*models.Game, error)
	JoinGame(ctx context.Context, gameID string, blackID string) (*models.Game, error)
	FinishGame(ctx context.Context, gameID string, winnerID string) error
	GetGame(ctx context.Context, gameID string) (*models.Game, error)
	GetUserGames(ctx context.Context, userID string) ([]*models.Game, error)
	GetLeaderboard(ctx context.Context, league string) ([]*models.LeaderboardEntry, error)
}

type gameService struct {
	repo ports.Repository
}

func NewGameService(repo ports.Repository) GameService {
	return &gameService{repo: repo}
}

func (s *gameService) CreateGame(ctx context.Context, whiteID string) (*models.Game, error) {
	game := &models.Game{
		WhiteID: whiteID,
	}

	return s.repo.CreateGame(ctx, game)
}

func (s *gameService) JoinGame(ctx context.Context, gameID string, blackID string) (*models.Game, error) {
	game, err := s.repo.GetGameByID(ctx, gameID)
	if err != nil {
		return nil, fmt.Errorf("game not found: %w", err)
	}

	if game.WhiteID == blackID {
		return nil, fmt.Errorf("cannot join your own game")
	}

	if game.BlackID != nil {
		return nil, fmt.Errorf("game is full")
	}

	if err := s.repo.JoinGame(ctx, gameID, blackID); err != nil {
		return nil, err
	}

	game.BlackID = &blackID
	game.Status = "active"

	return game, nil
}

func (s *gameService) FinishGame(ctx context.Context, gameID string, winnerID string) error {
	game, err := s.repo.GetGameByID(ctx, gameID)
	if err != nil {
		return fmt.Errorf("game not found: %w", err)
	}

	if game.Status == "finished" {
		return nil
	}

	if game.BlackID == nil || *game.BlackID == "" {
		// игра с ботом — просто финишируем без обновления статистики
		return s.repo.FinishGame(ctx, gameID, winnerID)
	}

	// определяем loserID
	loserID := game.WhiteID
	if game.WhiteID == winnerID {
		loserID = *game.BlackID
	}

	if err := s.repo.FinishGame(ctx, gameID, winnerID); err != nil {
		return err
	}

	return s.repo.UpdateStats(ctx, winnerID, loserID)
}

func (s *gameService) GetGame(ctx context.Context, gameID string) (*models.Game, error) {
	return s.repo.GetGameByID(ctx, gameID)
}

func (s *gameService) GetUserGames(ctx context.Context, userID string) ([]*models.Game, error) {
	return s.repo.GetUserGames(ctx, userID)
}

func (s *gameService) GetLeaderboard(ctx context.Context, league string) ([]*models.LeaderboardEntry, error) {
	return s.repo.GetLeaderboard(ctx, league)
}
