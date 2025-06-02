# -------- Build Stage --------
FROM rust:1.84 AS builder

WORKDIR /usr/src/app

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release && rm -r src

COPY . .
RUN cargo build --release

# -------- Runtime Stage --------
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /usr/src/app/target/release/backend_ide .

EXPOSE 8000

CMD ["./backend_ide"]
