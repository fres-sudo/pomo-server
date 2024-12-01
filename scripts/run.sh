#!/bin/bash
set -e

echo "Running database migrations..."
cd scripts
bun db:migrate
cd ..

echo "Starting the application..."
bun run dev
