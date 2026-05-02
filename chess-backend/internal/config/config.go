package config

import (
	"github.com/joho/godotenv"
	"log"
	"os"
)

type Config struct {
	DBHost                  string
	DBUser                  string
	DBPassword              string
	DBName                  string
	FirebaseCredentialsPath string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	return &Config{
		DBHost:                  getEnv("DB_HOST", "localhost"),
		DBUser:                  getEnv("DB_USER", "postgres"),
		DBName:                  getEnv("DB_NAME", "postgres"),
		DBPassword:              getEnv("DB_PASSWORD", "postgres"),
		FirebaseCredentialsPath: getEnv("FIREBASE_CREDENTIALS_PATH", "./serviceAccount.json"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
