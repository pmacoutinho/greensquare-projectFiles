package main

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MarketSVC struct {
	db *gorm.DB
}

func NewMarketSVC(db *gorm.DB) MarketplaceService {
	return &MarketSVC{db: db}
}

// TODO missing filtering
func (s *MarketSVC) GetSellerListings(ctx context.Context, userID uuid.UUID, page, limit int) ([]CreditListing, error) {
	var listings []CreditListing
	offset := (page - 1) * limit

	query := s.db.WithContext(ctx).
		Preload("CarbonCredit").
		Preload("CarbonCredit.Land").
		Preload("CarbonCredit.Land.Seller").
		Joins("JOIN carbon_credits ON credit_listings.carbon_credits_id = carbon_credits.id").
		Joins("JOIN lands ON carbon_credits.land_id = lands.id").
		Joins("JOIN sellers ON lands.owner_id = sellers.id").
		Where("sellers.user_id = ?", userID).
		Offset(offset).
		Limit(limit)

	if err := query.Find(&listings).Error; err != nil {
		return nil, err
	}

	return listings, nil
}

func (s *MarketSVC) GetSellerListingByID(ctx context.Context, userID uuid.UUID, listingID uuid.UUID) (*CreditListing, error) {
	var listing CreditListing

	query := s.db.WithContext(ctx).
		Preload("CarbonCredit").
		Preload("CarbonCredit.Land").
		Preload("CarbonCredit.Land.Seller").
		Joins("JOIN carbon_credits ON credit_listings.carbon_credits_id = carbon_credits.id").
		Joins("JOIN lands ON carbon_credits.land_id = lands.id").
		Joins("JOIN sellers ON lands.owner_id = sellers.id").
		Where("sellers.user_id = ? and credit_listings.id = ?", userID, listingID)

	if err := query.Find(&listing).Error; err != nil {
		return nil, err
	}

	return &listing, nil
}

func (s *MarketSVC) GetActiveListings(ctx context.Context, filter *FilterOptions, page, limit int) ([]CreditListing, error) {
	var listings []CreditListing
	query := s.db.WithContext(ctx).Model(&CreditListing{}).Offset((page-1)*limit).Limit(limit).Where("status = ?", "active")

	query = query.Preload("CarbonCredit").Preload("CarbonCredit.Land").Preload("CarbonCredit.Land.Seller")

	// Apply filters
	if filter != nil {
		if filter.MinPrice != nil {
			query = query.Where("price_per_credit >= ?", *filter.MinPrice)
		}
		if filter.MaxPrice != nil {
			query = query.Where("price_per_credit <= ?", *filter.MaxPrice)
		}
		if filter.BiomeType != nil {
			query = query.Joins("JOIN carbon_credits ON carbon_credits.id = credit_listings.carbon_credits_id").
				Joins("JOIN lands ON lands.id = carbon_credits.land_id").
				Where("lands.biome_type = ?", *filter.BiomeType)
		}

		if filter.Location != nil {
			query = query.Joins("JOIN carbon_credits ON carbon_credits.id = credit_listings.carbon_credits_id").
				Joins("JOIN lands ON lands.id = carbon_credits.land_id").
				Where("lands.location = ?", *filter.Location)
		}
	}

	if err := query.Find(&listings).Error; err != nil {
		return nil, err
	}

	return listings, nil
}

func (s *MarketSVC) GetActiveListingByID(ctx context.Context, id uuid.UUID) (*CreditListing, error) {
	var listing CreditListing

	if err := s.db.WithContext(ctx).
		Preload("CarbonCredit").
		Preload("CarbonCredit.Land").
		Preload("CarbonCredit.Land.Seller").
		Where("credit_listings.id = ?", id).
		First(&listing).Error; err != nil {
		return nil, err
	}

	return &listing, nil
}

func (s *MarketSVC) CreateListing(ctx context.Context, userID uuid.UUID, req CreateListingRequest) (*CreditListing, error) {
	var count int64
	err := s.db.WithContext(ctx).
		Table("carbon_credits").
		Joins("JOIN lands ON carbon_credits.land_id = lands.id").
		Joins("JOIN sellers ON lands.owner_id = sellers.id").
		Where("carbon_credits.id = ? AND sellers.user_id = ?", req.CarbonCreditsID, userID).
		Count(&count).Error

	if err != nil {
		return nil, err
	}

	if count == 0 {
		return nil, ErrUnauthorized
	}

	listing := &CreditListing{
		CarbonCreditsID: req.CarbonCreditsID,
		PricePerCredit:  req.PricePerCredit,
		MinimumPurchase: req.MinimumPurchase,
		MaximumPurchase: req.MaximumPurchase,
		Status:          req.Status,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := s.db.WithContext(ctx).Create(listing).Error; err != nil {
		return nil, err
	}

	return listing, nil
}

func (s *MarketSVC) UpdateListing(ctx context.Context, userID, listingID uuid.UUID, req UpdateListingRequest) (*CreditListing, error) {
	var listing CreditListing
	err := s.db.WithContext(ctx).
		Joins("JOIN carbon_credits ON credit_listings.carbon_credits_id = carbon_credits.id").
		Joins("JOIN lands ON carbon_credits.land_id = lands.id").
		Joins("JOIN sellers ON lands.owner_id = sellers.id").
		Where("credit_listings.id = ? AND sellers.user_id = ?", listingID, userID).
		First(&listing).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	listing.PricePerCredit = req.PricePerCredit
	listing.MinimumPurchase = req.MinimumPurchase
	listing.MaximumPurchase = req.MaximumPurchase
	listing.Status = req.Status
	listing.UpdatedAt = time.Now()

	if err := s.db.WithContext(ctx).Save(&listing).Error; err != nil {
		return nil, err
	}

	return &listing, nil
}

func (s *MarketSVC) DeleteListing(ctx context.Context, userID, listingID uuid.UUID) error {
	result := s.db.WithContext(ctx).
		Joins("JOIN carbon_credits ON credit_listings.carbon_credits_id = carbon_credits.id").
		Joins("JOIN lands ON carbon_credits.land_id = lands.id").
		Joins("JOIN sellers ON lands.owner_id = sellers.id").
		Where("credit_listings.id = ? AND sellers.user_id = ?", listingID, userID).
		Delete(&CreditListing{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

// func (s *MarketSVC) CheckCreditAvailability(ctx context.Context, creditID uuid.UUID, amount float64) error {
// 	return nil
// }
