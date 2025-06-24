package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"context"
	_ "marketplace-service/docs"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
	httpSwagger "github.com/swaggo/http-swagger/v2"
)

// @title Lands API
// @version 1.0
// @BasePath /api/lands/

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func main() {
	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(getEnv("AWS_REGION", "us-east-1")),
	)
	if err != nil {
		log.Fatalf("Failed to create AWS config: %v", err)
	}

	ssmClient := ssm.NewFromConfig(cfg)

	secretsManagerClient := secretsmanager.NewFromConfig(cfg)
	val, err := getSecretValue(secretsManagerClient, "postgres", ctx)
	if err != nil {
		log.Fatal("Can't get credentials:", err)
	}

	var creds DBCreds
	if err := json.Unmarshal(val, &creds); err != nil {
		log.Fatalf("unable to parse secret: %v", err)
	}

	rdsEndpoint := getParameter(ssmClient, "rds_endpoint", ctx)
	dbName := getParameter(ssmClient, "db_name", ctx)

	db, err := InitDB(rdsEndpoint, creds.Username, creds.Password, dbName)
	if err != nil {
		log.Fatalf("Error initializing database: %v\n", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB from gorm.DB: %v", err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("database connection test failed: %v", err)
	}

	log.Println("Database initialized successfully")
	defer sqlDB.Close()

	handler := NewHandler(NewLandSVC(db))

	http.HandleFunc("GET /api/lands/swagger/", httpSwagger.WrapHandler)
	http.HandleFunc("GET /api/lands/health/{$}", handler.handleHealthCheck)
	http.HandleFunc("GET /api/lands/user/{id}", handler.handleGetUserLands)
	http.HandleFunc("GET /api/lands/{id}", handler.handleGetLand)
	http.HandleFunc("POST /api/lands", handler.handleCreateLand)
	http.HandleFunc("PUT /api/lands/{id}", handler.handleUpdateLand)
	http.HandleFunc("DELETE /api/lands/{id}", handler.handleDeleteLand)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Starting server on port %s\n", port)
	if err = http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to create AWS session: %v", err)
	}
}
