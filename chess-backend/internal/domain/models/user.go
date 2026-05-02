package models

import "time"

type User struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Email     string    `json:"email" db:"email"`
	AvatarURL string    `json:"avatar_url" db:"avatar_url"`
	Wins      int       `json:"wins" db:"wins"`
	Losses    int       `json:"losses" db:"losses"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
