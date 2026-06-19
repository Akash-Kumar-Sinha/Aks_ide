package main

import (
	"auth_service/internal/database"
	"auth_service/internal/model"
	"log"
)

func init() {
	database.LoadEnv()
	database.Connect()
}

func main() {
	// database.DB.Migrator().DropTable(&model.User{}, &model.Profile{}, &model.Provider{}, &model.RefreshToken{})

	if err := database.DB.AutoMigrate(&model.User{}); err != nil {
		log.Printf("Error migrating User: %v", err)
		panic(err)
	}

	if err := database.DB.AutoMigrate(&model.Profile{}); err != nil {
		log.Printf("Error migrating Profile: %v", err)
		panic(err)
	}

	if err := database.DB.AutoMigrate(&model.Provider{}); err != nil {
		log.Printf("Error migrating Provider: %v", err)
		panic(err)
	}

	if err := database.DB.AutoMigrate(&model.RefreshToken{}); err != nil {
		log.Printf("Error migrating RefreshToken: %v", err)
		panic(err)
	}

	if err := database.DB.AutoMigrate(&model.WorkspaceContainer{}); err != nil {
		log.Printf("Error migrating WorkspaceContainer: %v", err)
		panic(err)
	}
}
