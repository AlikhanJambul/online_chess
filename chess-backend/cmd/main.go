package main

import (
	"chess-backend/internal/adapters/auth"
	"chess-backend/internal/adapters/db"
	"chess-backend/internal/config"
	"chess-backend/internal/transport/http"
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	cfg := config.Load()

	conn, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("Issue with connection to db: %v", err)
	}

	db.RunMigrations(conn)

	authClient, err := auth.ConnFireBase(cfg.FirebaseCredentialsPath)
	if err != nil {
		log.Fatalf("Issue with connection to firebase: %v", err)
	}

	r := gin.Default()

	http.Routes(r, authClient)
	r.Run(":8080")
}
