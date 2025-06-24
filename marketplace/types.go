package main

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type DBCreds struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

var (
	ErrNotFound     = errors.New("listing not found")
	ErrUnauthorized = errors.New("unauthorized access")
)

type FilterOptions struct {
	MinPrice   *float64 `json:"minPrice,omitempty"`
	MaxPrice   *float64 `json:"maxPrice,omitempty"`
	MinCredits *float64 `json:"minCredits,omitempty"`
	MaxCredits *float64 `json:"maxCredits,omitempty"`
	BiomeType  *string  `json:"biomeType,omitempty"`
	Location   *string  `json:"location,omitempty"`
}

type CreateListingRequest struct {
	CarbonCreditsID uuid.UUID `json:"carbonCreditsId"`
	PricePerCredit  float64   `json:"pricePerCredit"`
	MinimumPurchase float64   `json:"minimumPurchase"`
	MaximumPurchase *float64  `json:"maximumPurchase,omitempty"`
	Status          string    `json:"status"`
}

type UpdateListingRequest struct {
	PricePerCredit  float64  `json:"pricePerCredit"`
	MinimumPurchase float64  `json:"minimumPurchase"`
	MaximumPurchase *float64 `json:"maximumPurchase,omitempty"`
	Status          string   `json:"status"`
}

type CreateAuctionRequest struct {
	CarbonCreditsID uuid.UUID `json:"carbonCreditsId"`
	StartingPrice   float64   `json:"startingPrice"`
	ReservePrice    *float64  `json:"reservePrice,omitempty"`
	MinIncrement    float64   `json:"minIncrement"`
	StartTime       time.Time `json:"startTime"`
	EndTime         time.Time `json:"endTime"`
}

type MarketplaceService interface {
	// Listing operations
	GetSellerListingByID(ctx context.Context, userID uuid.UUID, listingID uuid.UUID) (*CreditListing, error)
	GetSellerListings(ctx context.Context, userID uuid.UUID, page, limit int) ([]CreditListing, error)
	GetActiveListings(ctx context.Context, filter *FilterOptions, page, pageSize int) ([]CreditListing, error)
	GetActiveListingByID(ctx context.Context, id uuid.UUID) (*CreditListing, error)

	CreateListing(ctx context.Context, userID uuid.UUID, req CreateListingRequest) (*CreditListing, error)
	UpdateListing(ctx context.Context, userID, listingID uuid.UUID, req UpdateListingRequest) (*CreditListing, error)
	DeleteListing(ctx context.Context, userID, listingID uuid.UUID) error

	// PlaceOrder(ctx context.Context, userID, listingID uuid.UUID) error

	// Auction operations
	// GetActiveAuctions(ctx context.Context, filter FilterOptions, page, pageSize int) ([]ListingResponse, int, error)
	// GetAuctionByID(ctx context.Context, id uuid.UUID) (*ListingResponse, error)
	// CreateAuction(ctx context.Context, userID uuid.UUID, req CreateAuctionRequest) (*ListingResponse, error)
	// PlaceBid(ctx context.Context, userID, auctionID uuid.UUID, amount float64) error

	// Verification operations
	// CheckLandVerification(ctx context.Context, userID, landID uuid.UUID) error
	// CheckCreditAvailability(ctx context.Context, creditID uuid.UUID, amount float64) error
}

type Handler struct {
	svc MarketplaceService
}

type ErrorResponse struct {
	Error string `json:"error"`
}
