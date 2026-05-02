package ports

import (
	"chess-backend/internal/domain/models"
	"context"
)

type Repository interface {
	//							--- User ---

	GetByID(ctx context.Context, id string) (*models.User, error)
	CreateUser(ctx context.Context, user *models.User) error

	//							--- Game ---

	CreateGame(ctx context.Context, game *models.Game) (*models.Game, error)
	GetGameByID(ctx context.Context, id string) (*models.Game, error)
	FinishGame(ctx context.Context, gameID string, winnerID string) error
	GetUserGames(ctx context.Context, userID string) ([]*models.Game, error)
	UpdateStats(ctx context.Context, winnerID string, loserID string) error
	JoinGame(ctx context.Context, gameID string, blackID string) error
	GetLeaderboard(ctx context.Context) ([]*models.LeaderboardEntry, error)
}
