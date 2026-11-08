# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY pkg/ ./pkg/
COPY services/telemetry/ ./services/telemetry/

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/telemetry-daemon ./services/telemetry

# Final minimal runner stage
FROM alpine:3.20

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /bin/telemetry-daemon /app/telemetry-daemon

EXPOSE 5023

ENTRYPOINT ["/app/telemetry-daemon"]
