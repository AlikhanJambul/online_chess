package auth

import (
	"context"
	"firebase.google.com/go/v4/auth"
	"fmt"

	firebase "firebase.google.com/go/v4"

	"google.golang.org/api/option"
)

func ConnFireBase(credentialsPath string) (*auth.Client, error) {
	ctx := context.Background()

	opt := option.WithCredentialsFile(credentialsPath)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app: %v", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}

	return authClient, nil
}
