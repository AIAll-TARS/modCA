#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Open the directory in Windows Explorer (WSL)
explorer.exe "$(wslpath -w "$SCRIPT_DIR")"

# Start backend server in Windows Terminal
wt.exe -w 0 new-tab --title "modCA Backend" --suppressApplicationTitle bash -c "cd '$SCRIPT_DIR/backend' && source venv/bin/activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

# Start frontend server in Windows Terminal
wt.exe -w 0 new-tab --title "modCA Frontend" --suppressApplicationTitle bash -c "cd '$SCRIPT_DIR/frontend' && npm run dev"

# Wait for servers to start
echo "Waiting for servers to start..."
sleep 5

# Open in default browser (using Windows)
cmd.exe /C start http://localhost:3000

echo "modCA_7web is starting..." 