package ports

import (
	"chess-backend/internal/domain/models"
	"context"
)

type Repository interface {
	GetByID(ctx context.Context, id string) (*models.User, error)
	CreateUser(ctx context.Context, user *models.User) error
}
