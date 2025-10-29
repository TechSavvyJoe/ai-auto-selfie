#!/usr/bin/env bash
set -euo pipefail

# Source project .env if present
if [ -f .env ]; then
  # export variables from .env
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Non-interactive inputs (override by editing this file or setting env vars before running)
ADMIN_EMAIL="admin@goldencar.com"
ADMIN_PASSWORD="StrongAdminPass123!"
ADMIN_FULL_NAME="Admin User"
DEFAULT_EMAIL="user@goldencar.com"
DEFAULT_PASSWORD="DefaultUserPass123!"
DEFAULT_FULL_NAME="Default User"
DEFAULT_PHONE="(800) 555-USER"
DEALERSHIP_PHONE="(800) 555-CARS"
DEALERSHIP_EMAIL="contact@goldencars.com"
DEALERSHIP_ADDRESS="123 Premium Auto Drive, Luxury City, CA 90210"

export ADMIN_EMAIL ADMIN_PASSWORD ADMIN_FULL_NAME DEFAULT_EMAIL DEFAULT_PASSWORD DEFAULT_FULL_NAME DEFAULT_PHONE DEALERSHIP_PHONE DEALERSHIP_EMAIL DEALERSHIP_ADDRESS

echo "Running setup script with VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-<not set>}"

npx ts-node scripts/setupInitialData.ts
