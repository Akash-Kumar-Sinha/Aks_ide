package token

import (
	"crypto/rsa"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

var (
	verifyKey *rsa.PublicKey
	signKey   *rsa.PrivateKey
)

func keyFunc(t *jwt.Token) (interface{}, error) {
	if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
		return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
	}
	return verifyKey, nil
}

func Generate(userID string, email string) (string, string, error) {
	atClaims := Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			Issuer:    "akssora-form-auth-service",
		},
	}
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodRS256, atClaims).SignedString(signKey)
	if err != nil {
		return "", "", err
	}

	rtClaims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		ID:        uuid.New().String(),
	}
	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodRS256, rtClaims).SignedString(signKey)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func VerifyAccess(tokenString string) (*Claims, error) {
	t, err := jwt.ParseWithClaims(tokenString, &Claims{}, keyFunc)
	if err != nil {
		return nil, err
	}
	if claims, ok := t.Claims.(*Claims); ok && t.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token")
}

func VerifyRefresh(tokenString string) (*jwt.RegisteredClaims, error) {
	t, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, keyFunc)
	if err != nil {
		return nil, err
	}
	if claims, ok := t.Claims.(*jwt.RegisteredClaims); ok && t.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token")
}
