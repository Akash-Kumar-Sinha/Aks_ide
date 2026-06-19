FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /bin/auth_service ./cmd/server && \
    go build -o /bin/migrate ./cmd/migrations

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /bin/auth_service .
COPY --from=builder /bin/migrate .
COPY private.pem public.pem ./
# Empty .env so godotenv.Load() succeeds; real values come from docker-compose env_file
RUN touch .env && \
    printf '#!/bin/sh\nset -e\necho "[auth_service] Running migrations..."\n./migrate\necho "[auth_service] Starting server..."\nexec ./auth_service\n' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
EXPOSE 8081
ENTRYPOINT ["/entrypoint.sh"]
