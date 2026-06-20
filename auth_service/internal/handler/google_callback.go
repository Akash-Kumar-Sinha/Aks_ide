package handler

import (
	"auth_service/internal/database"
	"auth_service/internal/model"
	"auth_service/internal/oauth"
	"auth_service/internal/token"
	"context"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
)

func Callback(c *gin.Context) {
	frontendURL := os.Getenv("FRONTEND_DOMAIN")

	if errParam := c.Query("error"); errParam != "" {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/auth")
		return
	}

	storedState, err := c.Cookie("oauth_state")
	if err != nil || storedState == "" || storedState != c.Query("state") {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/auth")
		return
	}
	c.SetCookie("oauth_state", "", -1, "/", "", false, true)

	code := c.Query("code")
	if code == "" {
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/auth")
		return
	}

	oauthToken, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
		return
	}

	userInfo, err := oauth.GetUserInfo(oauthToken.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}

	if !userInfo.VerifiedEmail {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "email_not_verified"})
		return
	}

	if idToken, ok := oauthToken.Extra("id_token").(string); ok {
		if err := validateIDToken(idToken, userInfo.ID); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid ID token"})
			return
		}
	}

	user, err := upsertUser(userInfo)
	if err != nil || user == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User processing failed"})
		return
	}

	accessToken, refreshToken, err := token.Generate(user.ID.String(), user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate system tokens"})
		return
	}

	err = database.DB.Create(&model.RefreshToken{
		Token:     refreshToken,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}

	backendDomain := os.Getenv("BACKEND_AUTH_DOMAIN")
	c.SetCookie("access_token", accessToken, 900, "/", backendDomain, true, true)
	c.SetCookie("refresh_token", refreshToken, 604800, "/", backendDomain, true, true)

	c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/workspace")
}

func validateIDToken(idToken, expectedSubject string) error {
	clientID := os.Getenv("GOOGLE_AUTH_CLIENT_ID")
	payload, err := idtoken.Validate(context.Background(), idToken, clientID)
	if err != nil {
		return fmt.Errorf("failed to validate ID token: %v", err)
	}
	if payload.Subject != expectedSubject {
		return fmt.Errorf("subject mismatch: expected %s, got %s", expectedSubject, payload.Subject)
	}
	return nil
}

// upsertUser finds the user by their Google provider account and returns it with
// Profile preloaded. On first login it creates both the User and Profile records.
func upsertUser(userInfo *oauth.UserInfo) (*model.User, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("failed to begin transaction: %v", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. Provider already linked - update last_login and return.
	provider, err := model.FindProviderByGoogle(tx, userInfo.ID)
	if err == nil {
		user, err := model.FindUserByID(tx, provider.UserID)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to find user for provider: %v", err)
		}
		if err := user.UpdateLastLogin(tx); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to update last login: %v", err)
		}
		if err := tx.Commit().Error; err != nil {
			return nil, fmt.Errorf("failed to commit: %v", err)
		}
		return user, nil
	}

	// 2. No provider record yet - find or create User by email.
	user, userErr := model.FindUserByEmail(tx, userInfo.Email)
	if userErr != nil {
		// Brand-new user: validate email, create User then Profile.
		addr, addrErr := mail.ParseAddress(userInfo.Email)
		if addrErr != nil {
			tx.Rollback()
			return nil, fmt.Errorf("invalid email format: %v", addrErr)
		}
		if addr.Address != userInfo.Email {
			tx.Rollback()
			return nil, fmt.Errorf("email address mismatch")
		}

		newUser := model.User{
			Email:     userInfo.Email,
			LastLogin: time.Now(),
		}
		if err := tx.Create(&newUser).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create user: %v", err)
		}

		username := strings.SplitN(addr.Address, "@", 2)[0]
		firstName, middleName, lastName := userInfo.ParseName()
		middleNameStr := ""
		if middleName != nil {
			middleNameStr = *middleName
		}

		profile := model.Profile{
			UserID:     newUser.ID,
			Email:      userInfo.Email,
			Username:   username,
			FirstName:  firstName,
			MiddleName: middleNameStr,
			LastName:   lastName,
			Avatar:     userInfo.Picture,
		}
		if err := tx.Create(&profile).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create profile: %v", err)
		}
		newUser.Profile = profile
		user = &newUser
	} else {
		// Existing user linking a new provider - update last_login.
		if err := user.UpdateLastLogin(tx); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to update last login: %v", err)
		}
	}

	// 3. Create the provider link.
	if err := tx.Create(&model.Provider{
		UserID:           user.ID,
		Name:             "google",
		ProviderClientID: userInfo.ID,
	}).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create provider: %v", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit: %v", err)
	}
	return user, nil
}
