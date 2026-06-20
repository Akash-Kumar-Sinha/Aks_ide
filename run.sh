#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDS=()

load_env() {
  local env_file="$1"

  if [[ -f "$env_file" ]]; then
    set -a
    source "$env_file"
    set +a
  fi
}

cleanup() {
  if (( ${#PIDS[@]} > 0 )); then
    kill "${PIDS[@]}" 2>/dev/null || true
  fi
}

start_service() {
  local name="$1"
  local dir="$2"
  local env_file="$3"
  shift 3

  echo "[run.sh] starting ${name}..."
  (
    cd "${ROOT_DIR}/${dir}"
    load_env "${ROOT_DIR}/${env_file}"
    exec "$@"
  ) &
  PIDS+=("$!")
}

run_step() {
  local name="$1"
  local dir="$2"
  local env_file="$3"
  shift 3

  echo "[run.sh] running ${name}..."
  (
    cd "${ROOT_DIR}/${dir}"
    load_env "${ROOT_DIR}/${env_file}"
    exec "$@"
  )
}

trap cleanup EXIT INT TERM

run_step "auth_service migrations" "auth_service" "auth_service/.env" go run ./cmd/migrations

start_service "auth_service"   "auth_service"   "auth_service/.env"           go run ./cmd/server
start_service "ws_ide"         "ws_ide"         "ws_ide/.env"                 cargo run
start_service "aks_ide_client" "aks_ide_client" "aks_ide_client/.env.local"   bun run dev

echo "[run.sh] all services started"
echo "[run.sh] press Ctrl+C to stop them"

while true; do
  set +e
  wait -n
  status=$?
  set -e

  if [[ $status -eq 0 ]]; then
    continue
  fi

  if [[ $status -eq 127 ]]; then
    break
  fi

  echo "[run.sh] a service exited with status ${status}, stopping the rest"
  exit "$status"
done