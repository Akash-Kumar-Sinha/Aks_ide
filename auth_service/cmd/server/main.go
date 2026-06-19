package main

import (
	"auth_service/internal/database"
	"auth_service/internal/router"
	"auth_service/internal/token"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	database.LoadEnv()
	database.Connect()
	token.Init()
}

func main() {
	r := gin.Default()

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "8000"
	}

	frontendDomain := os.Getenv("FRONTEND_DOMAIN")
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendDomain},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	
	r.GET("/api", func(c *gin.Context) { c.Redirect(301, "/") })
	r.GET("/api/v1", func(c *gin.Context) { c.Redirect(301, "/") })
	r.GET("/api/v1/auth", func(c *gin.Context) { c.Redirect(301, "/") })

	auth := r.Group("api/v1/auth")
	router.Register(auth)

	r.Run("0.0.0.0:" + PORT)
}
