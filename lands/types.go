package main

import (
	"github.com/google/uuid"
)

type DBCreds struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LandService interface {
	CreateLand(land *Land) error
	GetLand(id uuid.UUID) (*Land, error)
	UpdateLand(land *Land) error
	DeleteLand(id uuid.UUID) error
	ListLands(page, limit int) ([]Land, error)
	GetUserLands(userID uuid.UUID, page, limit int) ([]Land, error)
}

type LandRequest struct {
	Title                   string   `json:"title" validate:"required,max=100"`
	Description             *string  `json:"description"`
	SizeSquareMeters        float64  `json:"sizeSquareMeters" validate:"required,gt=0"`
	Location                string   `json:"location" validate:"required,max=100"`
	Latitude                float64  `json:"latitude" validate:"required"`
	Longitude               float64  `json:"longitude" validate:"required"`
	BiomeType               string   `json:"biomeType" validate:"required,max=50"`
	AverageHumidity         *float64 `json:"averageHumidity"`
	AverageTemperature      *float64 `json:"averageTemperature"`
	ElevationMeters         *float64 `json:"elevationMeters"`
	ForestDensityPercentage *float64 `json:"forestDensityPercentage"`
	TreeSpecies             []string `json:"treeSpecies"`
	SoilType                *string  `json:"soilType"`
	CertificationDate       *string  `json:"certificationDate"`
	CertificationAuthority  *string  `json:"certificationAuthority"`
}
