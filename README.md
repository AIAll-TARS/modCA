# modCA_7 Web Application

A web-based implementation of a modified Cellular Automata simulation featuring predator-prey dynamics and substrate interactions.

## Features

- Interactive grid-based simulation with a maximum size of 100x100 cells
- Real-time visualization of predator-prey interactions
- Configurable simulation parameters
- WebSocket support for live updates
- RESTful API for simulation control
- Responsive web interface

## System Requirements

- Python 3.8 or higher
- Node.js 14 or higher
- Modern web browser with WebSocket support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/modca_7web.git
cd modca_7web
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
cd ../frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when the backend server is running.

## Configuration

The simulation can be configured through the web interface or by making API calls. Key parameters include:

- Grid size (1-100)
- Initial number of predators and prey
- Predator and prey behavior parameters
- Substrate properties

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
