package handler

import (
	"auth_service/internal/database"
	"auth_service/internal/model"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func Logout(c *gin.Context) {
	accessToken, atErr := c.Cookie("access_token")
	refreshToken, rtErr := c.Cookie("refresh_token")

	if rtErr == nil && refreshToken != "" {
		database.DB.Where("token = ?", refreshToken).Delete(&model.RefreshToken{})
	}

	domain := os.Getenv("BACKEND_AUTH_DOMAIN")
	c.SetCookie("access_token", "", -1, "/", domain, true, true)
	c.SetCookie("refresh_token", "", -1, "/", domain, true, true)

	if atErr == nil && accessToken != "" {
		revokeURL := "https://oauth2.googleapis.com/revoke?token=" + accessToken
		resp, err := http.Post(revokeURL, "application/x-www-form-urlencoded", nil)
		if err == nil {
			resp.Body.Close()
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
