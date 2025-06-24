package main

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"

	_ "github.com/jinzhu/gorm/dialects/postgres"
)

type User struct {
	UserID uuid.UUID `gorm:"primary_key;type:uuid;default:uuid_generate_v4()"`
}

type Land struct {
	ID                      uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	OwnerID                 uuid.UUID      `gorm:"type:uuid;not null"`
	Title                   string         `gorm:"type:varchar(100);not null"`
	Description             *string        `gorm:"type:text"`
	SizeSquareMeters        float64        `gorm:"type:numeric(12,2);not null"`
	Location                string         `gorm:"type:varchar(100);not null"`
	Latitude                float64        `gorm:"type:numeric(9,6);not null"`
	Longitude               float64        `gorm:"type:numeric(9,6);not null"`
	BiomeType               string         `gorm:"type:varchar(50);not null"`
	AverageHumidity         *float64       `gorm:"type:numeric(5,2)"`
	AverageTemperature      *float64       `gorm:"type:numeric(5,2)"`
	ElevationMeters         *float64       `gorm:"type:numeric(7,2)"`
	ForestDensityPercentage *float64       `gorm:"type:numeric(5,2)"`
	TreeSpecies             pq.StringArray `gorm:"type:text[]"`
	SoilType                *string        `gorm:"type:varchar(50)"`
	CertificationDate       *time.Time     `gorm:"type:date"`
	CertificationAuthority  *string        `gorm:"type:varchar(100)"`
	VerificationStatus      string         `gorm:"type:verification_status;default:'pending'"`
	CreatedAt               time.Time      `gorm:"type:timestamptz;default:CURRENT_TIMESTAMP"`
	UpdatedAt               time.Time      `gorm:"type:timestamptz;default:CURRENT_TIMESTAMP"`

	// Relationships
	Seller        Seller         `gorm:"foreignKey:OwnerID"`
	CarbonCredits []CarbonCredit `gorm:"foreignKey:LandID"`
}

type Seller struct {
	ID                 uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	UserID             uuid.UUID  `gorm:"type:uuid;not null"`
	VerificationStatus string     `gorm:"type:verification_status;default:'pending'"`
	VerificationDate   *time.Time `gorm:"type:timestamptz"`

	// Relationships
	Lands []Land `gorm:"foreignKey:OwnerID"`
}

type CarbonCredit struct {
	ID                   uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	LandID               uuid.UUID  `gorm:"type:uuid;not null"`
	VerificationID       *string    `gorm:"type:varchar(100)"`
	TotalCredits         float64    `gorm:"type:numeric(12,2);not null"`
	CreditsAvailable     float64    `gorm:"type:numeric(12,2);not null"`
	CreditsSold          float64    `gorm:"type:numeric(12,2);default:0"`
	VintageYear          *int       `gorm:"type:int"`
	ExpirationDate       *time.Time `gorm:"type:date"`
	VerificationStandard *string    `gorm:"type:varchar(50)"`
	CreatedAt            time.Time  `gorm:"type:timestamptz;default:CURRENT_TIMESTAMP"`

	// Relationships
	Land     Land            `gorm:"foreignKey:LandID"`
	Listings []CreditListing `gorm:"foreignKey:CarbonCreditsID"`
}

type CreditListing struct {
	ID              uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	CarbonCreditsID uuid.UUID `gorm:"type:uuid;not null"`
	PricePerCredit  float64   `gorm:"type:numeric(10,2);not null"`
	MinimumPurchase float64   `gorm:"type:numeric(10,2);not null"`
	MaximumPurchase *float64  `gorm:"type:numeric(10,2)"`
	Status          string    `gorm:"type:listing_status;default:'draft'"`
	CreatedAt       time.Time `gorm:"type:timestamptz;default:CURRENT_TIMESTAMP"`
	UpdatedAt       time.Time `gorm:"type:timestamptz;default:CURRENT_TIMESTAMP"`

	// Relationships
	CarbonCredit CarbonCredit `gorm:"foreignKey:CarbonCreditsID"` // Many-to-one with CarbonCredit
}
