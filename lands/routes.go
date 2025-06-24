package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

type Handler struct {
	svc LandService
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

func NewHandler(svc LandService) *Handler {
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

// handleHealthCheck godoc
// @Summary Check API health
// @Description Returns OK if the API is running
// @Tags Health
// @Success 200 {string} string "OK"
// @Router /api/lands/health [get]
func (h *Handler) handleHealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

// handleCreateLand godoc
// @Summary Create a new land
// @Description Creates a new land entry
// @Tags Lands
// @Accept json
// @Produce json
// @Param land body Land true "Land object"
// @Success 201 {object} Land
// @Failure 401 {object} ErrorResponse
// @Failure 400 {object} ErrorResponse
// @Router /api/lands [post]
func (h *Handler) handleCreateLand(w http.ResponseWriter, r *http.Request) {
	if !h.checkSellerRole(w, r) {
		return
	}

	userID, ok := h.getUserIDFromHeader(w, r)
	if !ok {
		return
	}

	var landReq LandRequest
	if err := json.NewDecoder(r.Body).Decode(&landReq); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}

	land := Land{
		OwnerID:                 userID,
		Title:                   landReq.Title,
		Description:             landReq.Description,
		SizeSquareMeters:        landReq.SizeSquareMeters,
		Location:                landReq.Location,
		Latitude:                landReq.Latitude,
		Longitude:               landReq.Longitude,
		BiomeType:               landReq.BiomeType,
		AverageHumidity:         landReq.AverageHumidity,
		AverageTemperature:      landReq.AverageTemperature,
		ElevationMeters:         landReq.ElevationMeters,
		ForestDensityPercentage: landReq.ForestDensityPercentage,
		TreeSpecies:             pq.StringArray(landReq.TreeSpecies),
		SoilType:                landReq.SoilType,
	}

	if landReq.CertificationDate != nil {
		if certDate, err := time.Parse("2006-01-02", *landReq.CertificationDate); err == nil {
			land.CertificationDate = &certDate
		} else {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid certification date format"})
			return
		}
	}

	land.CertificationAuthority = landReq.CertificationAuthority

	if err := h.svc.CreateLand(&land); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(land)
}

// handleGetUserLands godoc
// @Summary Get all lands owned by a user
// @Description Retrieves all lands owned by the user specified in id path value
// @Tags Lands
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10)"
// @Success 200 {array} Land
// @Failure 401 {object} ErrorResponse
// @Failure 400 {object} ErrorResponse
// @Router /api/lands/my [get]
func (h *Handler) handleGetUserLands(w http.ResponseWriter, r *http.Request) {
	if !h.checkSellerRole(w, r) {
		return
	}

	userID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid user ID"})
		return
	}

	page, limit := getPaginationParams(r)
	lands, err := h.svc.GetUserLands(userID, page, limit)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(lands)
}

// handleGetLand godoc
// @Summary Get a land by ID
// @Description Retrieves a land entry by its ID
// @Tags Lands
// @Produce json
// @Param id path string true "Land ID"
// @Success 200 {object} Land
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /api/lands/{id} [get]
func (h *Handler) handleGetLand(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid land ID"})
		return
	}

	land, err := h.svc.GetLand(id)
	if err != nil {
		if err == ErrNotFound {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "land not found"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(land)
}

// handleUpdateLand godoc
// @Summary Update a land
// @Description Updates an existing land entry
// @Tags Lands
// @Accept json
// @Produce json
// @Param id path string true "Land ID"
// @Param land body Land true "Land object"
// @Success 200 {object} Land
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /api/lands/{id} [put]
func (h *Handler) handleUpdateLand(w http.ResponseWriter, r *http.Request) {
	if !h.checkSellerRole(w, r) {
		return
	}

	// Get the Land ID from the URL
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid land ID"})
		return
	}

	// Get the User ID from the header
	userID, ok := h.getUserIDFromHeader(w, r)
	if !ok {
		return // Error response already handled in getUserIDFromHeader
	}

	// Decode the request body into a LandRequest struct
	var req LandRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}

	// Map the LandRequest fields to the Land model
	land := Land{
		ID:                      id,
		OwnerID:                 userID, // Ensure the owner is tied to the user
		Title:                   req.Title,
		Description:             req.Description,
		SizeSquareMeters:        req.SizeSquareMeters,
		Location:                req.Location,
		Latitude:                req.Latitude,
		Longitude:               req.Longitude,
		BiomeType:               req.BiomeType,
		AverageHumidity:         req.AverageHumidity,
		AverageTemperature:      req.AverageTemperature,
		ElevationMeters:         req.ElevationMeters,
		ForestDensityPercentage: req.ForestDensityPercentage,
		TreeSpecies:             pq.StringArray(req.TreeSpecies),
		SoilType:                req.SoilType,
		CertificationAuthority:  req.CertificationAuthority,
	}

	if req.CertificationDate != nil {
		if certDate, err := time.Parse("2006-01-02", *req.CertificationDate); err == nil {
			land.CertificationDate = &certDate
		} else {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid certification date format"})
			return
		}
	}

	if err := h.svc.UpdateLand(&land); err != nil {
		if err == ErrNotFound {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "land not found"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(land)
}

// handleDeleteLand godoc
// @Summary Delete a land
// @Description Deletes a land entry
// @Tags Lands
// @Produce json
// @Param id path string true "Land ID"
// @Success 204 "No Content"
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /api/lands/{id} [delete]
func (h *Handler) handleDeleteLand(w http.ResponseWriter, r *http.Request) {
	if !h.checkSellerRole(w, r) {
		return
	}

	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid land ID"})
		return
	}

	if err := h.svc.DeleteLand(id); err != nil {
		if err == ErrNotFound {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "land not found"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
