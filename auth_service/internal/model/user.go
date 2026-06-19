package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (u *User) UpdateLastLogin(db *gorm.DB) error {
	return db.Model(u).Update("last_login", time.Now()).Error
}

// Rotate atomically revokes the receiver token and inserts replacement in one transaction.
func (rt *RefreshToken) Rotate(db *gorm.DB, replacement RefreshToken) error {
	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := tx.Model(rt).Updates(map[string]interface{}{
			"revoked":    true,
			"revoked_at": &now,
		}).Error; err != nil {
			return err
		}
		return tx.Create(&replacement).Error
	})
}

type Base struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CreatedAt time.Time      `gorm:"type:timestamptz;default:now()"               json:"created_at"`
	UpdatedAt time.Time      `gorm:"type:timestamptz;autoUpdateTime"              json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"type:timestamptz;index"                       json:"-"`
}

// User is the security entity. Holds only auth-related data.
type User struct {
	Base
	Email     string    `gorm:"uniqueIndex;not null"            json:"email"`
	LastLogin time.Time `gorm:"type:timestamptz;default:now()" json:"last_login"`

	Profile       Profile        `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"profile,omitempty"`
	Providers     []Provider     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	RefreshTokens []RefreshToken `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// Profile holds public, shareable identity data.
// UserID is the FK to User (UUID). uniqueIndex enforces the 1:1 relationship.
// Email is a display copy of User.Email kept for convenience.
type Profile struct {
	Base
	UserID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	Email      string    `gorm:"uniqueIndex;not null"           json:"email"`
	Username   string    `gorm:"uniqueIndex;not null"           json:"username"`
	FirstName  string    `gorm:"not null"                       json:"first_name"`
	MiddleName string    `                                      json:"middle_name,omitempty"`
	LastName   string    `                                      json:"last_name,omitempty"`
	Avatar     string    `                                      json:"avatar,omitempty"`
}

// Provider represents a linked OAuth provider (google, github, …).
// Composite unique index on (name, provider_client_id) prevents duplicate accounts.
type Provider struct {
	Base
	UserID           uuid.UUID `gorm:"type:uuid;not null;index"`
	Name             string    `gorm:"not null;uniqueIndex:idx_provider_client"`
	ProviderClientID string    `gorm:"not null;uniqueIndex:idx_provider_client"`
}

type RefreshToken struct {
	Base
	UserID    uuid.UUID  `gorm:"type:uuid;not null;index"`
	Token     string     `gorm:"uniqueIndex;not null"`
	ExpiresAt time.Time  `gorm:"type:timestamptz;not null"`
	Revoked   bool       `gorm:"default:false"`
	RevokedAt *time.Time `gorm:"type:timestamptz"`
}

// WorkspaceContainer tracks the Docker dev-env container for each user.
type WorkspaceContainer struct {
	Base
	UserID      uuid.UUID `gorm:"type:uuid;not null;index"`
	ContainerID string    `gorm:"not null"`
	ImageName   string    `gorm:"not null;default:'ubuntu:20.04'"`
	Status      string    `gorm:"not null;default:'created'"`
	User        User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}
