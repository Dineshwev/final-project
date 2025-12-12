SHELL := /bin/bash
.PHONY: build run clean install dev

# Default target
all: build

# Install dependencies
install:
	npm install

# Clean node_modules
clean:
	rm -rf node_modules
	rm -rf package-lock.json

# Full clean install
clean-install: clean install

# Development server
dev:
	npm run dev

# Production build
build:
	npm run build

# Start production server
run:
	npm start

# Test the build
test:
	npm test

# Deploy to AWS
deploy:
	eb deploy

# Initialize EB
eb-init:
	eb init

# Status check
status:
	eb status