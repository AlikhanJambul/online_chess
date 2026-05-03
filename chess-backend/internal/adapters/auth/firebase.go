package auth

import (
	"context"
	"fmt"
	"os"

	"firebase.google.com/go/v4/auth"

	firebase "firebase.google.com/go/v4"

	"google.golang.org/api/option"
)

func ConnFireBase(credentialsPath string) (*auth.Client, error) {
	ctx := context.Background()

	var opt option.ClientOption

	if credsJSON := os.Getenv("FIREBASE_CREDENTIALS_JSON"); credsJSON != "" {
		opt = option.WithCredentialsJSON([]byte(credsJSON))
	} else {
		// локально читаем из файла
		opt = option.WithCredentialsFile(credentialsPath)
	}

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app: %v", err)
	}

	return app.Auth(ctx)
}
