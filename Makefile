.DEFAULT_GOAL := help

.PHONY: dev build lint format clean help

help:
	@echo "Available commands:"
	@echo "  make dev     - Start the Vite development server"
	@echo "  make build   - Build the project for production"
	@echo "  make lint    - Run Biome lint checks"
	@echo "  make format  - Run Biome formatter"
	@echo "  make clean   - Remove build artifacts and reinstall dependencies"

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm vitest run

verify: lint test build

lint:
	pnpm lint

format:
	pnpm format

clean:
	rm -rf dist
	rm -rf node_modules
	pnpm install
