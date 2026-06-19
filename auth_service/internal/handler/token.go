package handler

import (
	"auth_service/internal/database"
	"auth_service/internal/model"
	"auth_service/internal/token"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func Refresh(c *gin.Context) {
	oldToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "no_refresh_token"})
		return
	}

	claims, err := token.VerifyRefresh(oldToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_refresh_token"})
		return
	}

	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_token_subject"})
		return
	}

	user, err := model.FindUserByID(database.DB, userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user_not_found"})
		return
	}

	gracePeriod := time.Now().Add(-10 * time.Second)
	storedToken, err := model.FindValidRefreshToken(database.DB, oldToken, gracePeriod)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "session_expired_or_revoked"})
		return
	}

	newAT, newRT, err := token.Generate(user.ID.String(), user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token_generation_failed"})
		return
	}

	if err := storedToken.Rotate(database.DB, model.RefreshToken{
		Token:     newRT,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "rotation_failed"})
		return
	}

	domain := os.Getenv("BACKEND_AUTH_DOMAIN")
	c.SetCookie("access_token", newAT, 900, "/", domain, true, true)
	c.SetCookie("refresh_token", newRT, 604800, "/", domain, true, true)

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}
