package main

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/schoolos/schoolos/pkg/ingestion"
)

// AutoDetectColumnsHandler implements POST /v1/ingestion/auto-detect-columns (DATA-26)
func (s *Server) AutoDetectColumnsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Headers []string `json:"headers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	mappings := ingestion.AutoDetectColumnMappings(req.Headers)
	resp := make(map[string]string)
	for colIdx, canonical := range mappings {
		if colIdx < len(req.Headers) {
			resp[req.Headers[colIdx]] = string(canonical)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"detected_mappings": resp,
		"total_mapped":      len(mappings),
		"total_headers":     len(req.Headers),
	})
}

// UploadCSVIngestionHandler implements POST /v1/ingestion/upload-csv (DATA-26)
func (s *Server) UploadCSVIngestionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var reader io.Reader
	contentType := r.Header.Get("Content-Type")

	if strings.Contains(contentType, "multipart/form-data") {
		err := r.ParseMultipartForm(10 << 20) // 10MB max
		if err != nil {
			http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
			return
		}
		file, _, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Missing 'file' field in form", http.StatusBadRequest)
			return
		}
		defer file.Close()
		reader = file
	} else {
		// Read raw body directly
		reader = r.Body
	}

	// Simulated existing database numbers to detect duplicate conflicts
	existingDB := map[string]bool{
		"DPS-EXISTS-999": true,
	}

	res, err := ingestion.ProcessCSVIngestion(reader, existingDB)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error":  err.Error(),
			"status": "INGESTION_FAILED",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(res)
}
