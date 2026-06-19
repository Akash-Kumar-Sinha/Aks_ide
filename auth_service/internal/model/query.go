package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func FindUserByID(db *gorm.DB, id uuid.UUID) (*User, error) {
	var u User
	if err := db.Where("id = ?", id).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func FindUserByEmail(db *gorm.DB, email string) (*User, error) {
	var u User
	if err := db.Preload("Profile").Where("email = ?", email).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func FindValidRefreshToken(db *gorm.DB, token string, gracePeriod time.Time) (*RefreshToken, error) {
	var rt RefreshToken
	if err := db.Where(
		"token = ? AND (revoked = false OR (revoked = true AND revoked_at > ?))",
		token, gracePeriod,
	).First(&rt).Error; err != nil {
		return nil, err
	}
	return &rt, nil
}

func FindProviderByGoogle(db *gorm.DB, googleID string) (*Provider, error) {
	var p Provider
	if err := db.Where("name = ? AND provider_client_id = ?", "google", googleID).First(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}
