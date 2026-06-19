package handler

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOauthConfig *oauth2.Config

func initOAuthConfig() {
	redirectURL := os.Getenv("GOOGLE_AUTH_REDIRECT_URL")
	if redirectURL == "" {
		panic("Google OAuth redirect URL not configured")
	}

	googleOauthConfig = &oauth2.Config{
		RedirectURL:  redirectURL,
		ClientID:     os.Getenv("GOOGLE_AUTH_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_AUTH_CLIENT_SECRET"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
			"openid",
		},
		Endpoint: google.Endpoint,
	}
}

func newStateToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func Login(c *gin.Context) {
	if googleOauthConfig == nil {
		initOAuthConfig()
	}

	if os.Getenv("GOOGLE_AUTH_CLIENT_ID") == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Google OAuth client ID not configured"})
		return
	}

	state, err := newStateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate state token"})
		return
	}

	c.SetCookie("oauth_state", state, 300, "/", "", false, true)

	url := googleOauthConfig.AuthCodeURL(
		state,
		oauth2.AccessTypeOffline,
		oauth2.ApprovalForce,
	)

	http.Redirect(c.Writer, c.Request, url, http.StatusTemporaryRedirect)
}
