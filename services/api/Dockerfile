# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY pkg/ ./pkg/
COPY services/api/ ./services/api/

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/schoolos-api ./services/api

# Final minimal runner stage
FROM alpine:3.20

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /bin/schoolos-api /app/schoolos-api

EXPOSE 8080

ENTRYPOINT ["/app/schoolos-api"]
