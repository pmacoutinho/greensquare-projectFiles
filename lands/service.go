package main

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LandSVC struct {
	db *gorm.DB
}

func NewLandSVC(db *gorm.DB) LandService {
	return &LandSVC{db: db}
}

var (
	ErrUnauthorized = errors.New("unauthorized access")
	ErrNotFound     = errors.New("land not found")
)

func (s *LandSVC) CreateLand(land *Land) error {
	var seller Seller
	if err := s.db.Where("user_id = ?", land.OwnerID).First(&seller).Error; err != nil {
		return err
	}

	land.OwnerID = seller.ID

	return s.db.Create(land).Error
}

func (s *LandSVC) GetLand(id uuid.UUID) (*Land, error) {
	var land Land
	if err := s.db.First(&land, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &land, nil
}

func (s *LandSVC) UpdateLand(land *Land) error {
	var seller Seller
	if err := s.db.Where("user_id = ?", land.OwnerID).First(&seller).Error; err != nil {
		return err
	}

	land.OwnerID = seller.ID

	land.UpdatedAt = time.Now()
	result := s.db.Model(&Land{}).Where("id = ?", land.ID).Updates(land)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *LandSVC) DeleteLand(id uuid.UUID) error {
	result := s.db.Delete(&Land{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *LandSVC) ListLands(page, limit int) ([]Land, error) {
	var lands []Land
	offset := (page - 1) * limit
	err := s.db.Offset(offset).Limit(limit).Find(&lands).Error
	return lands, err
}

func (s *LandSVC) GetUserLands(userID uuid.UUID, page, limit int) ([]Land, error) {
	var lands []Land
	offset := (page - 1) * limit

	err := s.db.Joins("JOIN sellers ON lands.owner_id = sellers.id").
		Where("sellers.user_id = ?", userID).
		Offset(offset).
		Limit(limit).
		Find(&lands).Error

	return lands, err
}
