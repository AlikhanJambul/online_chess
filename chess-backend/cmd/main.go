package main

import (
	firebase "chess-backend/internal/adapters/auth"
	"chess-backend/internal/adapters/db"
	"chess-backend/internal/app/usecase/auth"
	"chess-backend/internal/app/usecase/game"
	"chess-backend/internal/config"
	"chess-backend/internal/transport/http"
	"chess-backend/internal/transport/ws"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	conn, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("Issue with connection to db: %v", err)
	}

	db.RunMigrations(conn)

	authClient, err := firebase.ConnFireBase(cfg.FirebaseCredentialsPath)
	if err != nil {
		log.Fatalf("Issue with connection to firebase: %v", err)
	}

	repo := db.NewRepository(conn)
	authService := auth.NewService(repo, authClient)
	gameService := game.NewGameService(repo)

	wsHandler := ws.NewHub()

	handler := http.NewHandler(authService, gameService)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	handler.Routes(r, authClient, wsHandler)
	r.Run(":" + cfg.Port)
}
