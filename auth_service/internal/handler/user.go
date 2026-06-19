package handler

import (
	"auth_service/internal/database"
	"auth_service/internal/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CurrentUser(c *gin.Context) {
	userEmail := c.GetString("userEmail")
	if userEmail == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found in context"})
		return
	}

	user, err := model.FindUserByEmail(database.DB, userEmail)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found or token invalid"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"profile": user.Profile})
}
