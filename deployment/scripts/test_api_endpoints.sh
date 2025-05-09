#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="https://ws.janis7ewski.org"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\nTesting: ${description}"
    echo "Endpoint: ${method} ${endpoint}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X ${method} "${BASE_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    else
        response=$(curl -s -w "\n%{http_code}" -X ${method} "${BASE_URL}${endpoint}")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        echo -e "${GREEN}✓ Success (${status_code})${NC}"
        echo "Response: $body"
    else
        echo -e "${RED}✗ Failed (${status_code})${NC}"
        echo "Response: $body"
    fi
}

# Test health check
test_endpoint "GET" "/health" "" "Health Check"

# Test settings endpoints
test_endpoint "GET" "/api/settings" "" "Get All Settings"

# Test simulation endpoints
SIMULATION_DATA='{
    "grid_size": 50,
    "steps": 10,
    "neighborhood_type": "moore",
    "grid_type": "toroidal",
    "predator_death_probability": 0.1,
    "predator_birth_probability": 0.2,
    "initial_predators": 10,
    "predator_starvation_steps": 5,
    "prey_hunted_probability": 0.3,
    "prey_random_death": 0.1,
    "initial_prey": 20,
    "prey_birth_probability": 0.2,
    "prey_starvation_steps": 3,
    "prey_threat_response": 0.5,
    "initial_substrate_probability": 0.3,
    "substrate_random_death": 0.1,
    "substrate_consumption_prob": 0.2,
    "record_simulation": true
}'

# Start a new simulation
test_endpoint "POST" "/api/simulate" "$SIMULATION_DATA" "Start New Simulation"

# Get simulation ID from the response
SIMULATION_ID=$(curl -s -X POST "${BASE_URL}/api/simulate" \
    -H "Content-Type: application/json" \
    -d "$SIMULATION_DATA" | jq -r '.simulation_id')

if [ -n "$SIMULATION_ID" ]; then
    # Test simulation status
    test_endpoint "GET" "/api/simulate/${SIMULATION_ID}/status" "" "Get Simulation Status"
    
    # Test simulation step
    test_endpoint "POST" "/api/simulate/${SIMULATION_ID}/step" '{"steps": 1}' "Step Simulation"
    
    # Test save recording
    test_endpoint "POST" "/api/simulate/${SIMULATION_ID}/save-recording" "" "Save Simulation Recording"
fi

# Test recordings endpoints
test_endpoint "GET" "/api/recordings" "" "List Recordings"

# Test WebSocket connection
echo -e "\nTesting WebSocket Connection"
echo "Note: This is a basic connection test. Full WebSocket testing requires a client implementation."
curl -v -N -H "Connection: Upgrade" \
    -H "Upgrade: websocket" \
    -H "Host: ws.janis7ewski.org" \
    -H "Origin: https://ws.janis7ewski.org" \
    "wss://ws.janis7ewski.org/ws/simulate/${SIMULATION_ID}"

echo -e "\nAPI Testing Complete" 