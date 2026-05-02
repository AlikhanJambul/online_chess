package auth

import (
	"chess-backend/internal/domain/models"
	"chess-backend/internal/domain/ports"
	"context"
	"database/sql"
	"errors"
	"firebase.google.com/go/v4/auth"
)

type AuthService interface {
	LoginOrCreate(ctx context.Context, uid string) (*models.User, error)
}

type authService struct {
	repo       ports.Repository
	authClient *auth.Client
}

func NewService(repo ports.Repository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) LoginOrCreate(ctx context.Context, uid string) (*models.User, error) {
	user, err := s.repo.GetByID(ctx, uid)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	if errors.Is(err, sql.ErrNoRows) {
		firebaseUser, err := s.authClient.GetUser(ctx, uid)
		if err != nil {
			return nil, err
		}

		newUser := &models.User{
			ID:        uid,
			Name:      firebaseUser.DisplayName,
			Email:     firebaseUser.Email,
			AvatarURL: firebaseUser.PhotoURL,
		}

		if err := s.repo.CreateUser(ctx, newUser); err != nil {
			return nil, err
		}

		return newUser, nil
	}

	return user, nil
}
