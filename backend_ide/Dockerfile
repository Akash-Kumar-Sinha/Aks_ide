FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef

WORKDIR /usr/src/app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder 
COPY --from=planner /usr/src/app/recipe.json recipe.json

COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
EXPOSE 8000
COPY --from=builder /usr/src/app/target/release/backend_ide /usr/local/bin
ENTRYPOINT ["/usr/local/bin/backend_ide"]