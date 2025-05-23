#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting VPS deployment...${NC}"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Fetch latest changes
echo -e "${YELLOW}Fetching latest changes from prod...${NC}"
git fetch origin prod

# Check if we're on vps-deploy branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "vps-deploy" ]; then
    echo -e "${RED}Error: Not on vps-deploy branch. Please switch to vps-deploy branch first.${NC}"
    exit 1
fi

# Pull changes from prod
echo -e "${YELLOW}Pulling changes from prod...${NC}"
git pull origin prod --no-ff

# Stop containers
echo -e "${YELLOW}Stopping containers...${NC}"
docker-compose down

# Start containers
echo -e "${YELLOW}Starting containers...${NC}"
docker-compose up -d

# Check container health
echo -e "${YELLOW}Checking container health...${NC}"
sleep 10
if docker-compose ps | grep -q "unhealthy"; then
    echo -e "${RED}Warning: Some containers are unhealthy. Check logs with 'docker-compose logs'${NC}"
else
    echo -e "${GREEN}All containers are healthy!${NC}"
fi

# Test API health endpoint
echo -e "${YELLOW}Testing API health endpoint...${NC}"
if curl -s -f https://ws.janis7ewski.org/health > /dev/null; then
    echo -e "${GREEN}API health check passed!${NC}"
else
    echo -e "${RED}API health check failed!${NC}"
fi

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${YELLOW}Don't forget to:${NC}"
echo "1. Check container logs if needed: docker-compose logs"
echo "2. Monitor the application for any issues"
echo "3. Verify SSL certificates are valid" 