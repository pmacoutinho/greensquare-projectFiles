package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
)

func NewHandler(svc MarketplaceService) *Handler {
	return &Handler{svc: svc}
}

func getPaginationParams(r *http.Request) (int, int) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page := 1
	limit := 10

	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}
	if limitStr != "" {
		limit, _ = strconv.Atoi(limitStr)
	}

	return page, limit
}

func getFilters(r *http.Request) (*FilterOptions, error) {
	qs := r.URL.Query()

	filters := &FilterOptions{}

	if minPriceStr := qs.Get("minPrice"); minPriceStr != "" {
		minPrice, err := strconv.ParseFloat(minPriceStr, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid minPrice: %v", err)
		}
		filters.MinPrice = &minPrice
	}

	if maxPriceStr := qs.Get("maxPrice"); maxPriceStr != "" {
		maxPrice, err := strconv.ParseFloat(maxPriceStr, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid maxPrice: %v", err)
		}
		filters.MaxPrice = &maxPrice
	}

	if biomeTypeStr := qs.Get("biomeType"); biomeTypeStr != "" {
		filters.BiomeType = &biomeTypeStr
	}

	if locationStr := qs.Get("location"); locationStr != "" {
		filters.Location = &locationStr
	}

	// Return the filters options
	return filters, nil
}

func (h *Handler) checkSellerRole(w http.ResponseWriter, r *http.Request) bool {
	role := r.Header.Get("X-User-Role")
	if role != "seller" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "unauthorized: seller role required"})
		return false
	}
	return true
}

func (h *Handler) getUserIDFromHeader(w http.ResponseWriter, r *http.Request) (uuid.UUID, bool) {
	userIDStr := r.Header.Get("X-User-ID")
	if userIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "unauthorized: user ID not provided"})
		return uuid.Nil, false
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid user ID format"})
		return uuid.Nil, false
	}

	return userID, true
}

// handleHealthCheck godoc
// @Summary Check API health
// @Description Returns OK if the API is running
// @Tags Health
// @Success 200 {string} string "OK"
// @Router /api/market/health [get]
func (h *Handler) handleHealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

// @Summary Get seller's private listings
// @Description Retrieves a paginated list of listings belonging to the authenticated seller
// @Tags listings
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param page query integer false "Page number (default: 1)"
// @Param limit query integer false "Number of items per page (default: 10)"
// @Success 200 {array} Land
// @Failure 401 {object} ErrorResponse "Unauthorized - Invalid or missing seller credentials"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /api/market/private [get]
func (h *Handler) handlePrivateListings(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), time.Second)
	defer cancel()

	if !h.checkSellerRole(w, r) {
		return
	}

	userID, ok := h.getUserIDFromHeader(w, r)
	if !ok {
		return
	}

	page, limit := getPaginationParams(r)
	lands, err := h.svc.GetSellerListings(ctx, userID, page, limit)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(lands)
}

// @Summary Get seller's private listing by ID
// @Description Retrieves a specific listing belonging to the authenticated seller
// @Tags listings
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param id path string true "Listing ID (UUID format)"
// @Success 200 {object} Land
// @Failure 400 {string} string "Invalid listing ID"
// @Failure 401 {object} ErrorResponse "Unauthorized - Invalid or missing seller credentials"
// @Failure 404 {string} string "Listing not found"
// @Failure 500 {string} string "Internal server error"
// @Failure 504 {string} string "Request timed out"
// @Router /api/market/private/{id} [get]
func (h *Handler) handlePrivateListingsByID(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), time.Second)
	defer cancel()

	if !h.checkSellerRole(w, r) {
		return
	}

	userID, ok := h.getUserIDFromHeader(w, r)
	if !ok {
		return
	}

	listingID, err := uuid.Parse(r.PathValue("id"))

	if err != nil {
		http.Error(w, "Invalid listing ID", http.StatusBadRequest)
		return
	}

	res, err := h.svc.GetSellerListingByID(ctx, userID, listingID)

	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) { // Check if the error is due to timeout
			http.Error(w, "Request timed out", http.StatusGatewayTimeout)
			return
		}

		http.Error(w, "Failed to get active listings: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// @Summary Get active listings
// @Description Retrieves a paginated list of all active listings with optional filters
// @Tags listings
// @Accept json
// @Produce json
// @Param page query integer false "Page number (default: 1)"
// @Param limit query integer false "Number of items per page (default: 10)"
// @Param minPrice query number false "Minimum price filter"
// @Param maxPrice query number false "Maximum price filter"
// @Param location query string false "Location filter"
// @Success 200 {array} Land
// @Failure 400 {string} string "Invalid filters on request"
// @Failure 500 {string} string "Internal server error"
// @Failure 504 {string} string "Request timed out"
// @Router /api/market/active [get]
func (h *Handler) handleActiveListings(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), time.Second)
	defer cancel()

	page, limit := getPaginationParams(r)
	filters, err := getFilters(r)

	if err != nil {
		http.Error(w, "Invalid filters on request: "+err.Error(), http.StatusBadRequest)
		return
	}

	res, err := h.svc.GetActiveListings(ctx, filters, page, limit)

	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) { // Check if the error is due to timeout
			http.Error(w, "Request timed out", http.StatusGatewayTimeout)
			return
		}

		http.Error(w, "Failed to get active listings: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// @Summary Get active listing by ID
// @Description Retrieves a specific active listing by its ID
// @Tags listings
// @Accept json
// @Produce json
// @Param id path string true "Listing ID (UUID format)"
// @Success 200 {object} Land
// @Failure 400 {string} string "Invalid listing ID"
// @Failure 404 {string} string "Listing not found"
// @Failure 500 {string} string "Internal server error"
// @Failure 504 {string} string "Request timed out"
// @Router /api/market/active/{id} [get]
func (h *Handler) handleActiveListingsByID(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), time.Second)
	defer cancel()

	listingID, err := uuid.Parse(r.PathValue("id"))

	if err != nil {
		http.Error(w, "Invalid listing ID", http.StatusBadRequest)
		return
	}

	res, err := h.svc.GetActiveListingByID(ctx, listingID)

	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) { // Check if the error is due to timeout
			http.Error(w, "Request timed out", http.StatusGatewayTimeout)
			return
		}

		http.Error(w, "Failed to get active listings: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// handleCreateListing godoc
// @Summary Create a new credit listing
// @Description Creates a new credit listing for a seller's carbon credits
// @Tags listings
// @Accept json
// @Produce json
// @Param X-User-ID header string true "User ID"
// @Param X-User-Role header string true "User Role (must be 'seller')"
// @Param listing body CreateListingRequest true "Listing creation request"
// @Success 201 {object} CreditListing "Created listing"
// @Failure 400 {object} ErrorResponse "Invalid request"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /api/market/private [post]
func (h *Handler) handleCreateListing(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.getUserIDFromHeader(w, r)
	if !ok {
		return
	}

	if !h.checkSellerRole(w, r) {
		return
	}

	var req CreateListingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}

	listing, err := h.svc.CreateListing(r.Context(), userID, req)
	if err != nil {
		status := http.StatusInternalServerError
		if err == ErrUnauthorized {
			status = http.StatusUnauthorized
		}
		w.WriteHeader(status)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(listing)
}

// handleUpdateListing godoc
// @Summary Update an existing credit listing
// @Description Updates an existing credit listing owned by the seller
// @Tags listings
// @Accept json
// @Produce json
// @Param X-User-ID header string true "User ID"
// @Param X-User-Role header string true "User Role (must be 'seller')"
// @Param id path string true "Listing ID" format(uuid)
// @Param listing body UpdateListingRequest true "Listing update request"
// @Success 200 {object} CreditListing "Updated listing"
// @Failure 400 {object} ErrorResponse "Invalid request"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 404 {object} ErrorResponse "Listing not found"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /api/market/private/{id} [put]
func (h *Handler) handleUpdateListing(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.getUserIDFromHeader(w, r)
	if !ok {
		return
	}

	if !h.checkSellerRole(w, r) {
		return
	}

	listingID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid listing ID"})
		return
	}

	var req UpdateListingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}

	listing, err := h.svc.UpdateListing(r.Context(), userID, listingID, req)
	if err != nil {
		status := http.StatusInternalServerError
		switch err {
		case ErrNotFound:
			status = http.StatusNotFound
		case ErrUnauthorized:
			status = http.StatusUnauthorized
		}
		w.WriteHeader(status)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(listing)
}

// handleDeleteListing godoc
// @Summary Delete a credit listing
// @Description Deletes an existing credit listing owned by the seller
// @Tags listings
// @Produce json
// @Param X-User-ID header string true "User ID"
// @Param X-User-Role header string true "User Role (must be 'seller')"
// @Param id path string true "Listing ID" format(uuid)
// @Success 204 "No Content"
// @Failure 400 {object} ErrorResponse "Invalid request"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 404 {object} ErrorResponse "Listing not found"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /api/market/private/{id} [delete]
func (h *Handler) handleDeleteListing(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.getUserIDFromHeader(w, r)
	if !ok {
		return
	}

	if !h.checkSellerRole(w, r) {
		return
	}

	listingID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid listing ID"})
		return
	}

	if err := h.svc.DeleteListing(r.Context(), userID, listingID); err != nil {
		status := http.StatusInternalServerError
		if err == ErrNotFound {
			status = http.StatusNotFound
		}
		w.WriteHeader(status)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
