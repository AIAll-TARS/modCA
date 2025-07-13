# modCA Web Application

A web-based ecosystem simulation based on cellular automata where predators, prey, and substrate interact based on probabilistic rules.

## Features

- Interactive grid-based simulation with support for large grids (up to 400x400 cells)
- Real-time visualization with pan and zoom for large grids
- Live population charts and statistics
- Configurable simulation parameters with validation
- WebSocket support for real-time updates
- RESTful API for simulation control
- Dark mode support
- Mobile-responsive design
- Save/load simulation settings

## System Requirements

- Python 3.8 or higher
- Node.js 16 or higher
- Modern web browser with WebSocket support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AIAll-TARS/modCA.git
cd modCA
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

## Development

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
# For local development
npm run dev

# With production API
NEXT_PUBLIC_API_URL=https://ws.janis7ewski.org/api NEXT_PUBLIC_WS_URL=wss://ws.janis7ewski.org/ws npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Development Workflow

1. Make changes to the code
2. Run `npm run build` in the frontend directory to verify TypeScript and build
3. Fix any TypeScript errors or build issues
4. Commit changes with descriptive messages
5. Push to the prod branch for automatic deployment

## API Documentation

The API documentation is available at:
- Local: `http://localhost:8000/docs`
- Production: `https://ws.janis7ewski.org/api/docs`

## Configuration

The simulation can be configured through the web interface. Key parameters include:

- Grid size (up to 400x400)
- Initial populations (predators, prey)
- Behavior probabilities
- Grid and neighborhood types
- Substrate properties
- Recording options

All parameters have validation limits to ensure stable simulation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make changes and test locally
4. Run build to verify TypeScript (`npm run build`)
5. Commit your changes (`git commit -am 'Add your feature'`)
6. Push to the branch (`git push origin feature/your-feature`)
7. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
