package middleware

import (
	"auth_service/internal/token"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		t, err := c.Cookie("access_token")
		if err != nil || t == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		claims, err := token.VerifyAccess(t)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token_expired"})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("userEmail", fmt.Sprintf("%s", claims.Email))
		c.Next()
	}
}
