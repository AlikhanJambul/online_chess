package models

import "time"

type Game struct {
	ID         string     `json:"id" db:"id"`
	WhiteID    string     `json:"white_id" db:"white_id"`
	BlackID    *string    `json:"black_id" db:"black_id"`
	WinnerID   *string    `json:"winner_id" db:"winner_id"`
	PGN        string     `json:"pgn" db:"pgn"`
	Status     string     `json:"status" db:"status"` // waiting, active, finished
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	FinishedAt *time.Time `json:"finished_at" db:"finished_at"`
}

type LeaderboardEntry struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
	Wins      int    `json:"wins"`
	Losses    int    `json:"losses"`
	Rank      int    `json:"rank"`
}
