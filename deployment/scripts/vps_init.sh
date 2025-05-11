#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Initializing VPS repository...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Installing...${NC}"
    apt-get update && apt-get install -y git
fi

# Create project directory if it doesn't exist
PROJECT_DIR="/root/modca_7web"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Creating project directory...${NC}"
    mkdir -p "$PROJECT_DIR"
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Initialize git repository
echo -e "${YELLOW}Initializing git repository...${NC}"
git init

# Add remote repository
echo -e "${YELLOW}Adding remote repository...${NC}"
git remote add origin https://github.com/AIAll-TARS/modca_7web.git

# Create vps-deploy branch
echo -e "${YELLOW}Creating vps-deploy branch...${NC}"
git checkout -b vps-deploy

# Create VPS-specific directories
echo -e "${YELLOW}Creating VPS-specific directories...${NC}"
mkdir -p vps_config/ssl
mkdir -p vps_config/nginx

# Create .gitignore for VPS
echo -e "${YELLOW}Creating .gitignore...${NC}"
cat > .gitignore << EOL
# VPS-specific
vps_config/ssl/*
vps_config/.env
!vps_config/ssl/.gitkeep

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOL

# Create placeholder files
touch vps_config/ssl/.gitkeep
touch vps_config/.env.example

# Pull initial code
echo -e "${YELLOW}Pulling initial code from prod branch...${NC}"
git fetch origin prod
git pull origin prod --no-ff

echo -e "${GREEN}VPS repository initialized!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy your SSL certificates to vps_config/ssl/"
echo "2. Create vps_config/.env from vps_config/.env.example"
echo "3. Update any VPS-specific configurations"
echo "4. Run docker-compose up -d to start the services" 