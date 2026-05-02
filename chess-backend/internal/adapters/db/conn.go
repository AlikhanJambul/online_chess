package db

import (
	"chess-backend/internal/config"
	"database/sql"
	"fmt"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"log"
	"log/slog"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

func Connect(cfg *config.Config) (*sql.DB, error) {
	fmt.Println(cfg)

	postgresConnStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName)

	db, err := sql.Open("postgres", postgresConnStr)
	if err != nil {
		slog.Error("Не удалось подключится в PostgreSQL")
		return nil, fmt.Errorf("ошибка подключения к PostgreSQL: %w", err)
	}

	if err := db.Ping(); err != nil {
		db.Close()
		slog.Error("Не удалось подключится в PostgreSQL")
		return nil, fmt.Errorf("не удалось подключиться к PostgreSQL: %w", err)
	}

	slog.Info("Успешное подключение к PostgreSQL!")
	return db, nil
}

func RunMigrations(db *sql.DB) {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		log.Fatalf("Failed to create migration driver: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://internal/db/migrations",
		"postgres",
		driver,
	)
	if err != nil {
		log.Fatalf("Failed to init migrations: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("Migrations applied")
}
