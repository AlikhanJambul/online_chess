package db

import (
	"chess-backend/internal/domain/models"
	"chess-backend/internal/domain/ports"
	"context"
	"database/sql"
)

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) ports.Repository {
	return &repository{db: db}
}

func (r *repository) GetByID(ctx context.Context, id string) (*models.User, error) {
	query := `SELECT id, name, email, avatar_url, wins, losses, created_at FROM users WHERE id = $1`
	user := models.User{}

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.AvatarURL,
		&user.Wins,
		&user.Losses,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *repository) CreateUser(ctx context.Context, user *models.User) error {
	query := `INSERT INTO users (id, name, email, avatar_url) VALUES ($1, $2, $3, $4)`

	_, err := r.db.ExecContext(ctx, query, user.ID, user.Name, user.Email, user.AvatarURL)

	return err
}
