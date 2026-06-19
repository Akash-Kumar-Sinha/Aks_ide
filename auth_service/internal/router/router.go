package router

import (
	"auth_service/internal/handler"
	"auth_service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func Register(r *gin.RouterGroup) {
	r.GET("/oauth/google/login", handler.Login)
	r.GET("/oauth/callback", handler.Callback)

	r.POST("/oauth/refresh", handler.Refresh)

	r.POST("/logout", middleware.Auth(), handler.Logout)
	r.GET("/me", middleware.Auth(), handler.CurrentUser)
}
