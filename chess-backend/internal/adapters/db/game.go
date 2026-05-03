package db

import (
	"chess-backend/internal/domain/models"
	"context"
	"database/sql"
	"time"
)

func (r *repository) CreateGame(ctx context.Context, game *models.Game) (*models.Game, error) {
	query := `
		INSERT INTO games (white_id, status) 
		VALUES ($1, 'waiting') 
		RETURNING id, white_id, black_id, winner_id, pgn, status, created_at, finished_at`

	result := &models.Game{}
	err := r.db.QueryRowContext(ctx, query, game.WhiteID).Scan(
		&result.ID,
		&result.WhiteID,
		&result.BlackID,
		&result.WinnerID,
		&result.PGN,
		&result.Status,
		&result.CreatedAt,
		&result.FinishedAt,
	)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (r *repository) GetGameByID(ctx context.Context, id string) (*models.Game, error) {
	query := `
		SELECT id, white_id, black_id, winner_id, pgn, status, created_at, finished_at 
		FROM games WHERE id = $1`

	game := &models.Game{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&game.ID,
		&game.WhiteID,
		&game.BlackID,
		&game.WinnerID,
		&game.PGN,
		&game.Status,
		&game.CreatedAt,
		&game.FinishedAt,
	)
	if err != nil {
		return nil, err
	}

	return game, nil
}

func (r *repository) FinishGame(ctx context.Context, gameID string, winnerID string) error {
	now := time.Now()

	var winner sql.NullString
	if winnerID != "" {
		winner = sql.NullString{String: winnerID, Valid: true}
	}

	query := `
		UPDATE games 
		SET status = 'finished', winner_id = $1, finished_at = $2 
		WHERE id = $3`

	_, err := r.db.ExecContext(ctx, query, winner, now, gameID)
	return err
}

func (r *repository) GetUserGames(ctx context.Context, userID string) ([]*models.Game, error) {
	query := `
		SELECT id, white_id, black_id, winner_id, pgn, status, created_at, finished_at 
		FROM games 
		WHERE white_id = $1 OR black_id = $1 
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var games []*models.Game
	for rows.Next() {
		game := &models.Game{}
		err := rows.Scan(
			&game.ID,
			&game.WhiteID,
			&game.BlackID,
			&game.WinnerID,
			&game.PGN,
			&game.Status,
			&game.CreatedAt,
			&game.FinishedAt,
		)
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}

	return games, nil
}

func (r *repository) UpdateStats(ctx context.Context, winnerID string, loserID string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `UPDATE users SET wins = wins + 1 WHERE id = $1`, winnerID); err != nil {
		return err
	}

	if _, err := tx.ExecContext(ctx, `UPDATE users SET losses = losses + 1 WHERE id = $1`, loserID); err != nil {
		return err
	}

	return tx.Commit()
}

func (r *repository) JoinGame(ctx context.Context, gameID string, blackID string) error {
	query := `UPDATE games SET black_id = $1, status = 'active' WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, blackID, gameID)
	return err
}

func (r *repository) GetLeaderboard(ctx context.Context) ([]*models.LeaderboardEntry, error) {
	query := `
		SELECT id, name, avatar_url, wins, losses,
		RANK() OVER (ORDER BY wins DESC) as rank
		FROM users
		ORDER BY wins DESC
		LIMIT 100`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*models.LeaderboardEntry
	for rows.Next() {
		entry := &models.LeaderboardEntry{}
		err := rows.Scan(
			&entry.ID,
			&entry.Name,
			&entry.AvatarURL,
			&entry.Wins,
			&entry.Losses,
			&entry.Rank,
		)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	return entries, nil
}
