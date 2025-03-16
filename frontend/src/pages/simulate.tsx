import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const inter = Inter({ subsets: ['latin'] })

// Entity colors
const COLORS = {
    0: 'black',   // Empty
    1: '#f7dc6f', // Prey (yellow)
    2: '#e74c3c', // Predator (red)
    3: '#27ae60'  // Substrate (green)
}

// Define the validation schema
const SimulationSchema = Yup.object().shape({
    grid_size: Yup.number()
        .required('Required'),
    steps: Yup.number()
        .required('Required'),
    neighborhood_type: Yup.string()
        .required('Required'),
    grid_type: Yup.string()
        .required('Required'),
    record_simulation: Yup.boolean(),
    predator_death_probability: Yup.number()
        .required('Required'),
    predator_birth_probability: Yup.number()
        .required('Required'),
    initial_predators: Yup.number()
        .required('Required'),
    predator_starvation_steps: Yup.number()
        .required('Required'),
    prey_hunted_probability: Yup.number()
        .required('Required'),
    prey_random_death: Yup.number()
        .required('Required'),
    initial_prey: Yup.number()
        .required('Required'),
    prey_birth_probability: Yup.number()
        .required('Required'),
    prey_starvation_steps: Yup.number()
        .required('Required'),
    initial_substrate_probability: Yup.number()
        .required('Required'),
    substrate_random_death: Yup.number()
        .required('Required'),
    substrate_consumption_prob: Yup.number()
        .required('Required'),
})

export default function Simulate() {
    const router = useRouter()
    const [simulationId, setSimulationId] = useState<string | null>(null)
    const [status, setStatus] = useState<string>('idle')
    const [currentStep, setCurrentStep] = useState<number>(0)
    const [totalSteps, setTotalSteps] = useState<number>(0)
    const [grid, setGrid] = useState<number[][]>([])
    const [statistics, setStatistics] = useState<any>({})
    const [isGridFullscreen, setIsGridFullscreen] = useState<boolean>(false)
    const [chartData, setChartData] = useState<any>({
        labels: [],
        datasets: [
            {
                label: 'Predators',
                data: [],
                borderColor: '#e74c3c',  // Red for predators
                backgroundColor: 'rgba(231, 76, 60, 0.5)',
                borderWidth: 2
            },
            {
                label: 'Prey',
                data: [],
                borderColor: '#f7dc6f',  // Yellow for prey
                backgroundColor: 'rgba(247, 220, 111, 0.5)',
                borderWidth: 2
            },
            {
                label: 'Substrate',
                data: [],
                borderColor: '#27ae60',  // Green for substrate
                backgroundColor: 'rgba(39, 174, 96, 0.5)',
                borderWidth: 2
            },
        ],
    })

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const [wsConnected, setWsConnected] = useState<boolean>(false)

    // Default simulation settings
    const hardcodedDefaults = {
        grid_size: 50,
        steps: 100,
        neighborhood_type: 'moore',
        grid_type: 'torus',
        predator_death_probability: 0.1,
        predator_birth_probability: 0.3,
        initial_predators: 50,
        predator_starvation_steps: 10,
        prey_hunted_probability: 0.2,
        prey_random_death: 0.05,
        initial_prey: 200,
        prey_birth_probability: 0.2,
        prey_starvation_steps: 3,
        initial_substrate_probability: 0.3,
        substrate_random_death: 0.05,
        substrate_consumption_prob: 0.2,
        record_simulation: false
    }

    // Load saved settings from localStorage or use defaults
    const [defaultSettings, setDefaultSettings] = useState(hardcodedDefaults);

    // Load saved settings from localStorage on component mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('simulationSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                console.log('Loaded saved settings from localStorage:', parsedSettings);
                setDefaultSettings(parsedSettings);
            }
        } catch (error) {
            console.error('Error loading saved settings:', error);
            // Fall back to hardcoded defaults if there's an error
        }
    }, []);

    // Function to save settings to localStorage
    const saveSettingsToLocalStorage = (settings) => {
        try {
            localStorage.setItem('simulationSettings', JSON.stringify(settings));
            console.log('Settings saved to localStorage:', settings);
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
        }
    };

    // Add viewport state for large grids
    const [viewportOffset, setViewportOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const LARGE_GRID_THRESHOLD = 200; // Grids larger than this will use viewport rendering

    // First, add a new state variable to track whether a recording is available and has been saved
    const [recordingAvailable, setRecordingAvailable] = useState<boolean>(false);
    const [recordingSaved, setRecordingSaved] = useState<boolean>(false);

    // Add a new state variable to track adjustments
    const [valueAdjustments, setValueAdjustments] = useState<any>(null);

    // Draw the grid on canvas
    useEffect(() => {
        if (!grid.length || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Adjust canvas dimensions when in fullscreen mode
        if (isGridFullscreen) {
            // Use more space in fullscreen mode
            const containerWidth = window.innerWidth * 0.98; // 98% of window width
            const containerHeight = window.innerHeight * 0.95; // 95% of window height
            canvas.width = containerWidth;
            canvas.height = containerHeight;
        } else {
            // Default size when not fullscreen (maintain aspect ratio)
            canvas.width = 400;
            canvas.height = 400;
        }

        // Clear canvas with background color
        ctx.fillStyle = isGridFullscreen ? '#1f2937' : '#f3f4f6'; // Match the dark background in fullscreen
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Determine if we're working with a large grid
        const isLargeGrid = grid.length > LARGE_GRID_THRESHOLD;

        // Calculate cell size based on zoom level for large grids
        let cellSize = 1;
        let visibleGridSize = grid.length;
        let offsetX = 0;
        let offsetY = 0;

        if (isLargeGrid && isGridFullscreen) {
            // For large grids in fullscreen, implement viewport rendering
            // Base cell size on zoom level (higher zoom = larger cells)
            const baseCellSize = Math.min(
                canvas.width / grid.length,
                canvas.height / grid.length
            );

            // Apply zoom (limit max cell size to reasonable value)
            cellSize = Math.min(Math.max(baseCellSize * zoomLevel, 1), 50);

            // Calculate how many cells fit in the viewport
            const visibleCellsX = Math.ceil(canvas.width / cellSize);
            const visibleCellsY = Math.ceil(canvas.height / cellSize);

            // Adjust visible area based on viewport offset (with bounds checking)
            offsetX = Math.max(0, Math.min(grid.length - visibleCellsX, viewportOffset.x));
            offsetY = Math.max(0, Math.min(grid.length - visibleCellsY, viewportOffset.y));

            // Draw only the visible portion of the grid
            const endX = Math.min(offsetX + visibleCellsX, grid.length);
            const endY = Math.min(offsetY + visibleCellsY, grid.length);

            // Draw grid cells (only those in viewport)
            for (let y = offsetY; y < endY; y++) {
                for (let x = offsetX; x < endX; x++) {
                    const cellValue = grid[y][x];
                    ctx.fillStyle = COLORS[cellValue as keyof typeof COLORS];
                    ctx.fillRect(
                        (x - offsetX) * cellSize,
                        (y - offsetY) * cellSize,
                        cellSize,
                        cellSize
                    );
                }
            }

            // Draw grid borders for better visibility
            if (cellSize > 2) {
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 0.5;

                // Draw vertical grid lines
                for (let x = 0; x <= endX - offsetX; x++) {
                    ctx.beginPath();
                    ctx.moveTo(x * cellSize, 0);
                    ctx.lineTo(x * cellSize, (endY - offsetY) * cellSize);
                    ctx.stroke();
                }

                // Draw horizontal grid lines
                for (let y = 0; y <= endY - offsetY; y++) {
                    ctx.beginPath();
                    ctx.moveTo(0, y * cellSize);
                    ctx.lineTo((endX - offsetX) * cellSize, y * cellSize);
                    ctx.stroke();
                }
            }

            // Show viewport information
            ctx.font = '14px sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            const viewportInfo = `Grid: ${grid.length}×${grid.length} | Viewport: (${offsetX},${offsetY}) | Cell size: ${cellSize.toFixed(1)}px | Zoom: ${zoomLevel.toFixed(1)}x`;
            ctx.fillText(viewportInfo, 10, canvas.height - 10);

            // Show navigation help
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText('Navigation: Mouse drag to pan, Scroll wheel to zoom', 10, canvas.height - 30);

        } else {
            // Standard rendering for smaller grids
            cellSize = Math.min(
                Math.floor(canvas.width / grid.length),
                Math.floor(canvas.height / grid.length)
            );

            // Calculate grid dimensions in pixels
            const gridWidthPx = grid.length * cellSize;
            const gridHeightPx = grid[0].length * cellSize;

            // Center the grid in the canvas
            offsetX = Math.max(0, Math.floor((canvas.width - gridWidthPx) / 2));
            offsetY = Math.max(0, Math.floor((canvas.height - gridHeightPx) / 2));

            // Draw border
            ctx.strokeStyle = isGridFullscreen ? '#444' : '#333';
            ctx.strokeRect(offsetX, offsetY, gridWidthPx, gridHeightPx);

            // Draw all grid cells centered
            for (let y = 0; y < grid.length; y++) {
                for (let x = 0; x < grid[y].length; x++) {
                    const cellValue = grid[y][x];
                    ctx.fillStyle = COLORS[cellValue as keyof typeof COLORS];
                    ctx.fillRect(
                        offsetX + x * cellSize,
                        offsetY + y * cellSize,
                        cellSize,
                        cellSize
                    );
                }
            }

            // For very large grids with tiny cells, add a help text
            if (cellSize < 2 && !isGridFullscreen) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, 0, canvas.width, 30);
                ctx.font = '12px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText('Grid cells are very small. Click "Fullscreen" for better view', canvas.width / 2, 20);
            }

            // Add grid size info in fullscreen mode
            if (isGridFullscreen) {
                ctx.font = '14px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'left';
                ctx.fillText(`Grid: ${grid.length}×${grid.length} | Cell size: ${cellSize}px | Step: ${currentStep}/${totalSteps}`, 10, canvas.height - 10);
            }
        }
    }, [grid, isGridFullscreen, currentStep, totalSteps, zoomLevel, viewportOffset]);

    // Add mouse event handlers for pan and zoom in fullscreen mode
    useEffect(() => {
        if (!isGridFullscreen || !canvasRef.current) return;

        const canvas = canvasRef.current;

        // Handler for mouse wheel zoom
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            // Adjust zoom based on scroll direction
            const zoomChange = e.deltaY < 0 ? 0.2 : -0.2;
            // Limit zoom range to avoid extremes
            setZoomLevel(prev => Math.min(Math.max(prev + zoomChange, 0.5), 20));
        };

        // Handler for mouse down to start drag
        const handleMouseDown = (e: MouseEvent) => {
            setIsDragging(true);
            setDragStart({
                x: e.clientX,
                y: e.clientY
            });
        };

        // Handler for mouse move to pan viewport
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            // Calculate drag distance and update viewport offset
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;

            // Scale the drag distance by zoom level (faster movement at high zoom)
            const dragScale = 1 / zoomLevel;

            setViewportOffset(prev => ({
                x: Math.max(0, prev.x - dx * dragScale),
                y: Math.max(0, prev.y - dy * dragScale)
            }));

            // Update drag start point
            setDragStart({
                x: e.clientX,
                y: e.clientY
            });
        };

        // Handler for mouse up to end drag
        const handleMouseUp = () => {
            setIsDragging(false);
        };

        // Add event listeners
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);

        // Cleanup
        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
        };
    }, [isGridFullscreen, isDragging, dragStart, zoomLevel]);

    // Reset viewport when toggling fullscreen or when grid changes
    useEffect(() => {
        setViewportOffset({ x: 0, y: 0 });
        setZoomLevel(1);
    }, [isGridFullscreen, grid.length]);

    // Toggle fullscreen mode for the grid
    const toggleGridFullscreen = () => {
        setIsGridFullscreen(!isGridFullscreen);
    };

    // Update chart with new statistics
    useEffect(() => {
        if (!statistics || !statistics.predator_count) return

        setChartData(prev => {
            const newLabels = [...prev.labels, currentStep]

            return {
                labels: newLabels,
                datasets: [
                    {
                        ...prev.datasets[0],
                        data: [...prev.datasets[0].data, statistics.predator_count],
                    },
                    {
                        ...prev.datasets[1],
                        data: [...prev.datasets[1].data, statistics.prey_count],
                    },
                    {
                        ...prev.datasets[2],
                        data: [...prev.datasets[2].data, statistics.substrate_count],
                    },
                ],
            }
        })
    }, [statistics, currentStep])

    // Start a new simulation
    const startSimulation = async (values: any) => {
        try {
            // Validate grid size
            if (Number(values.grid_size) > 400) {
                alert('Grid size cannot exceed 400x400');
                return;
            }

            // Validate total entities
            const totalCells = Number(values.grid_size) * Number(values.grid_size);
            const totalEntities = Number(values.initial_predators) + Number(values.initial_prey);

            if (totalEntities > totalCells) {
                alert(`Total number of predators (${values.initial_predators}) and prey (${values.initial_prey}) cannot exceed the total number of cells (${totalCells})`);
                return;
            }

            // Add warning for very large grids
            if (Number(values.grid_size) >= 200) {
                const confirmLargeGrid = window.confirm(
                    `You're creating a large grid (${values.grid_size}×${values.grid_size}) with ${values.grid_size * values.grid_size} cells.\n\n` +
                    `Large grids can be slow to render and may use significant memory.\n\n` +
                    `For best performance:\n` +
                    `- Use fullscreen mode\n` +
                    `- Use zoom and pan controls\n\n` +
                    `Continue with this large grid?`
                );

                if (!confirmLargeGrid) {
                    return;
                }
            }

            // Additional warning for extremely large grids that may timeout
            if (Number(values.grid_size) >= 800) {
                const confirmExtremeGrid = window.confirm(
                    `WARNING: Extremely large grid (${values.grid_size}×${values.grid_size}).\n\n` +
                    `Grids larger than 800×800 may cause server timeouts or memory issues.\n\n` +
                    `- The server may take a long time to respond\n` +
                    `- The simulation might fail to initialize\n\n` +
                    `Try reducing the grid size for better reliability.\n\n` +
                    `Proceed anyway with this extreme grid size?`
                );

                if (!confirmExtremeGrid) {
                    return;
                }
            }

            setStatus('loading')
            console.log('Starting simulation with raw form values:', values)

            // Calculate dynamic timeout based on grid size
            const gridSizeSquared = Number(values.grid_size) * Number(values.grid_size);
            // Base timeout of 30 seconds, plus 1 second per 10,000 cells
            const dynamicTimeout = 30000 + Math.floor(gridSizeSquared / 10000) * 1000;
            console.log(`Using dynamic timeout of ${dynamicTimeout}ms for grid size ${values.grid_size}`);

            // Validate values before sending to server
            const validatedValues = {
                ...values,
                // Convert string inputs to appropriate types
                grid_size: parseInt(values.grid_size || "100"),
                steps: parseInt(values.steps || "100"),
                initial_prey: parseInt(values.initial_prey || "2000"),
                initial_predators: parseInt(values.initial_predators || "3"),
                predator_death_probability: parseFloat(values.predator_death_probability || "0.05"),
                predator_birth_probability: parseFloat(values.predator_birth_probability || "0.33"),
                predator_starvation_steps: parseInt(values.predator_starvation_steps || "10"),
                prey_hunted_probability: parseFloat(values.prey_hunted_probability || "0.7"),
                prey_random_death: parseFloat(values.prey_random_death || "0.01"),
                prey_birth_probability: parseFloat(values.prey_birth_probability || "0.7"),
                prey_starvation_steps: parseInt(values.prey_starvation_steps || "3"),
                initial_substrate_probability: parseFloat(values.initial_substrate_probability || "0.25"),
                substrate_random_death: parseFloat(values.substrate_random_death || "0.03"),
                substrate_consumption_prob: parseFloat(values.substrate_consumption_prob || "0.6"),
                neighborhood_type: values.neighborhood_type,
                grid_type: values.grid_type
            }

            // DEBUG: Log all conversions to see if they're working correctly
            console.log('Conversion results:')
            console.log('grid_size:', values.grid_size, '->', validatedValues.grid_size)
            console.log('steps:', values.steps, '->', validatedValues.steps)
            console.log('initial_prey:', values.initial_prey, '->', validatedValues.initial_prey)
            console.log('initial_predators:', values.initial_predators, '->', validatedValues.initial_predators)
            console.log('predator_death_probability:', values.predator_death_probability, '->', validatedValues.predator_death_probability)

            // Note: Removed value limitations to allow any user input

            console.log('Validated values being sent to backend:', validatedValues)

            // Save the settings to localStorage for future use
            saveSettingsToLocalStorage(validatedValues);

            // Add timeout to axios request to prevent hanging indefinitely
            try {
                const response = await axios.post('/api/simulate', validatedValues, {
                    timeout: dynamicTimeout, // Dynamic timeout based on grid size
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                console.log('Raw response from backend:', response)
                console.log('Simulation started successfully, response data:', response.data)

                if (!response.data || !response.data.simulation_id) {
                    throw new Error('Invalid response from server - missing simulation ID')
                }

                const { simulation_id, status, current_step, total_steps, grid, statistics, db_save_success, adjustments } = response.data

                // Ensure all required data is present
                if (!simulation_id || !grid || !statistics) {
                    console.error('Invalid or incomplete simulation data received:', response.data)
                    throw new Error('Incomplete simulation data received from server')
                }

                // Validate that received data matches expectations
                console.log('Checking received data:')
                console.log('Grid dimensions:', grid.length > 0 ? `${grid.length}x${grid[0].length}` : 'Empty grid')
                console.log('Statistics received:', JSON.stringify(statistics))
                console.log('Current step:', current_step, 'of', total_steps)

                // Set all the state values
                setSimulationId(simulation_id)
                setStatus(status)
                setCurrentStep(current_step)
                setTotalSteps(total_steps)
                setGrid(grid)
                setStatistics(statistics)

                // Store adjustment information if present
                if (adjustments && adjustments.values_adjusted) {
                    console.log("Values were adjusted during initialization:", adjustments);
                    setValueAdjustments(adjustments);
                } else if (statistics && statistics.values_adjusted) {
                    // Some statistics objects might contain the adjustment info directly
                    console.log("Values were adjusted (from statistics):", statistics);
                    setValueAdjustments(statistics);
                } else {
                    console.log("No value adjustments were made");
                    setValueAdjustments(null);
                }

                // Check if recording is enabled and reset recording status
                setRecordingAvailable(validatedValues.record_simulation);
                setRecordingSaved(false);

                console.log(`Simulation ${simulation_id} started at step ${current_step} of ${total_steps}`)

                // Show database warning if save failed
                if (db_save_success === false) {
                    console.warn('Database save failed - settings will not be persisted')
                    // You could show a toast notification here if you want to inform the user
                }

                // Reset chart data
                setChartData({
                    labels: [0],
                    datasets: [
                        {
                            label: 'Predators',
                            data: [statistics.predator_count],
                            borderColor: '#e74c3c',  // Red for predators
                            backgroundColor: 'rgba(231, 76, 60, 0.5)',
                            borderWidth: 2
                        },
                        {
                            label: 'Prey',
                            data: [statistics.prey_count],
                            borderColor: '#f7dc6f',  // Yellow for prey
                            backgroundColor: 'rgba(247, 220, 111, 0.5)',
                            borderWidth: 2
                        },
                        {
                            label: 'Substrate',
                            data: [statistics.substrate_count],
                            borderColor: '#27ae60',  // Green for substrate
                            backgroundColor: 'rgba(39, 174, 96, 0.5)',
                            borderWidth: 2
                        },
                    ],
                })

                // Add a slight delay before connecting to WebSocket to ensure backend is ready
                setTimeout(() => {
                    console.log(`Connecting to WebSocket for simulation ${simulation_id}`)
                    connectWebSocket(simulation_id)

                    // Try to immediately step the simulation to verify it's working
                    setTimeout(() => {
                        if (status !== 'completed') {
                            console.log('Testing simulation stepping functionality')
                            stepSimulation(1)
                        }
                    }, 1000)
                }, 500)
            } catch (axiosError: any) {
                console.error('Axios error starting simulation:', axiosError)

                // Handle timeout errors specifically
                if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ECONNRESET') {
                    setStatus('error')
                    alert(`The server timed out trying to create a ${validatedValues.grid_size}×${validatedValues.grid_size} grid.\n\n` +
                        `This grid size is too large for the server to process.\n\n` +
                        `Please try again with a smaller grid size (we recommend 500×500 or less).`)
                    return
                }

                // Special handling for common error cases
                if (axiosError.response?.status === 500) {
                    // Check for specific error messages
                    const errorDetail = axiosError.response.data?.detail || '';

                    if (errorDetail.includes('grid initialization failed')) {
                        handleAxiosError(axiosError, 'Error initializing grid. Try reducing grid size or entity counts.')
                    } else if (errorDetail.includes('simulation initialization failed')) {
                        handleAxiosError(axiosError, 'Error creating simulation. Try with different parameters.')
                    } else if (errorDetail.includes('database')) {
                        // Database errors shouldn't prevent simulation
                        handleAxiosError(axiosError, 'Warning: Database error occurred but simulation will still run.')
                    } else {
                        // Generic server error
                        handleAxiosError(axiosError, 'Server error')
                    }
                } else {
                    // For other error types
                    handleAxiosError(axiosError, 'Error starting simulation')
                }
            }

        } catch (error: any) {
            console.error('General error during simulation start:', error)
            setStatus('error')
            alert(`Error: ${error.message || 'Unknown error occurred'}`)
        }
    }

    // Helper to handle Axios errors
    const handleAxiosError = (error: any, message: string) => {
        setStatus('error')

        if (error.response) {
            // The request was made and the server responded with a status code outside of 2xx
            console.error('Error response data:', error.response.data)
            console.error('Error response status:', error.response.status)

            const errorDetail = error.response.data?.detail || 'Unknown server error';
            const errorMessage = `${message}: ${errorDetail}`;

            alert(errorMessage)

            // Show more detailed debugging info in the console
            if (error.response.status === 500) {
                console.error('Server error (500). Please check server logs for more details.');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request)
            alert(`${message}: No response from server. Please check if the backend is running.`)
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message)
            alert(`${message}: ${error.message}`)
        }
    }

    // Connect to WebSocket
    const connectWebSocket = (simId: string) => {
        if (!simId) return

        console.log(`Connecting to WebSocket for simulation ${simId}`)

        // Clean up any existing connection
        if (wsRef.current) {
            wsRef.current.close()
        }

        // Use secure WebSocket if on HTTPS
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/ws/simulate/${simId}`

        console.log(`WebSocket URL: ${wsUrl}`)

        try {
            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                console.log('WebSocket connection established')
                setWsConnected(true)
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    console.log('WebSocket message:', data)

                    if (data.error) {
                        console.error('WebSocket error:', data.error)
                        setStatus('error')
                        return
                    }

                    // Handle simulation updates
                    if (data.grid && data.statistics) {
                        setStatus(data.status)
                        setCurrentStep(data.current_step)
                        setTotalSteps(data.total_steps)
                        setGrid(data.grid)
                        setStatistics(data.statistics)

                        // Update chart with new data
                        setChartData(prevData => {
                            const newLabels = [...prevData.labels, data.current_step]
                            return {
                                labels: newLabels,
                                datasets: [
                                    {
                                        ...prevData.datasets[0],
                                        data: [...prevData.datasets[0].data, data.statistics.predator_count],
                                    },
                                    {
                                        ...prevData.datasets[1],
                                        data: [...prevData.datasets[1].data, data.statistics.prey_count],
                                    },
                                    {
                                        ...prevData.datasets[2],
                                        data: [...prevData.datasets[2].data, data.statistics.substrate_count],
                                    },
                                ],
                            }
                        })
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error)
                }
            }

            ws.onclose = (event) => {
                console.log(`WebSocket closed with code ${event.code}`)
                setWsConnected(false)

                // Try to reconnect if connection was lost unexpectedly
                if (event.code !== 1000 && event.code !== 1001) {
                    console.log('Attempting to reconnect WebSocket in 5 seconds...')
                    setTimeout(() => connectWebSocket(simId), 5000)
                }
            }

            ws.onerror = (event) => {
                console.error('WebSocket error:', event)
                setWsConnected(false)
            }

            // Send a ping to ensure connection is working
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    sendWsCommand('ping')
                }
            }, 1000)

        } catch (error) {
            console.error('Error creating WebSocket connection:', error)
        }
    }

    // Send WebSocket command
    const sendWsCommand = (action: string, params: any = {}) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected, cannot send command')
            return false
        }

        const message = JSON.stringify({
            action,
            ...params,
        })

        console.log(`Sending WebSocket command: ${message}`)
        wsRef.current.send(message)
        return true
    }

    // Run one or more simulation steps
    const stepSimulation = (steps: number = 1) => {
        // Don't try to step if no simulation is loaded
        if (!simulationId) {
            console.log('No active simulation')
            return
        }

        // Don't step if already loading or completed
        if (status === 'loading') {
            console.log('Simulation is already loading, please wait')
            return
        }

        if (status === 'completed') {
            console.log('Simulation already completed')
            return
        }

        // Clear adjustment warnings after the first step
        // They're only relevant for the initial state
        if (currentStep === 0 && valueAdjustments) {
            setValueAdjustments(null);
        }

        // Update status
        setStatus('loading')

        // Calculate timeout based on grid size
        const gridSize = grid.length;
        const isLargeGrid = gridSize >= 500;
        const timeout = isLargeGrid ? 120000 : 30000; // 2 minutes for large grids, 30 seconds otherwise

        console.log(`Stepping simulation ${steps} steps with timeout ${timeout}ms...`)

        // Track retry attempts
        let retryCount = 0;
        const maxRetries = 3;

        // Create a function to attempt the step with retry capability
        const attemptStep = () => {
            // Step the simulation via REST API
            axios.post(`/api/simulate/${simulationId}/step?steps=${steps}`, {}, {
                timeout: timeout // Set timeout based on grid size
            })
                .then(response => {
                    console.log('Step complete, response:', response.data)
                    const { status, current_step, grid, statistics } = response.data

                    setStatus(status)
                    setCurrentStep(current_step)
                    setGrid(grid)
                    setStatistics(statistics)
                })
                .catch(error => {
                    console.error('Error stepping simulation:', error)

                    // Check if we should retry
                    if (retryCount < maxRetries &&
                        (error.code === 'ECONNABORTED' ||
                            error.code === 'ECONNRESET' ||
                            !error.response)) {

                        retryCount++;
                        console.log(`Connection issue detected. Retry attempt ${retryCount}/${maxRetries}...`);

                        // Wait a bit longer between each retry
                        const retryDelay = 3000 * retryCount;
                        setTimeout(() => {
                            attemptStep();
                        }, retryDelay);

                        // Show a non-blocking message to the user about the retry
                        const retryMsg = `Server connection issue. Retrying (${retryCount}/${maxRetries})...`;
                        setStatus(`retrying-${retryCount}`);

                        // Don't show full error dialog during retries
                        return;
                    }

                    // If we've exhausted retries or it's another type of error, handle normally
                    handleAxiosError(error, 'Failed to step simulation');

                    if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET') {
                        // For timeout/connection errors with large grids, provide more helpful message
                        if (isLargeGrid) {
                            alert(`The server is having trouble processing this large grid (${gridSize}×${gridSize}).\n\n` +
                                `Tips for large grids:\n` +
                                `- Use smaller step increments (try one step at a time)\n` +
                                `- Allow more time between steps\n` +
                                `- Restart the backend server if needed\n` +
                                `- Consider using a smaller grid size`);
                        }
                    }

                    setStatus('error');
                })
        };

        // Start the first attempt
        attemptStep();
    }

    // Reset the simulation
    const resetSimulation = () => {
        if (!simulationId) return

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sendWsCommand('reset')
        } else {
            // Reset via REST API or reload page
            window.location.reload()
        }
    }

    // Auto-run the simulation with improved error handling
    const autoRunSimulation = () => {
        if (!simulationId || status === 'completed' || status === 'stopped') {
            console.log('Cannot auto-run: simulation not in running state')
            return () => { }
        }

        console.log('Starting auto-run simulation')
        setStatus('running')

        // For large grids, use a longer interval
        const gridSize = grid.length;
        const isLargeGrid = gridSize >= 500;
        const stepInterval = isLargeGrid ? 2000 : 500; // 2 seconds for large grids, 500ms for smaller ones

        // Track consecutive failures to stop auto-run if there are too many
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 3;

        console.log(`Auto-run using ${stepInterval}ms interval (large grid: ${isLargeGrid})`)

        const interval = setInterval(() => {
            // Check if we're in a retry or error state
            if (status.startsWith('retrying') || status === 'error') {
                consecutiveFailures++;
                console.log(`Auto-run detected error/retry state (${consecutiveFailures}/${maxConsecutiveFailures})`)

                // If we've had too many consecutive failures, stop auto-run
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    console.log('Too many consecutive failures, stopping auto-run')
                    clearInterval(interval)
                    alert('Auto-run stopped due to persistent connection issues. Please try manual stepping or restart the simulation.')
                    return
                }

                // Skip this step and continue
                return
            }

            // We had a successful step, reset the failure counter
            consecutiveFailures = 0

            // Check current state to decide whether to continue
            if (currentStep >= totalSteps) {
                console.log('Auto-run complete: reached total steps')
                clearInterval(interval)
                setStatus('completed')
                return
            }

            // Also check if we're already in a loading state
            if (status === 'loading') {
                console.log('Skipping auto-run step: simulation is still processing previous step')
                return
            }

            // Use standard stepping method with just 1 step at a time for better reliability
            stepSimulation(1)
        }, stepInterval)

        // Return cleanup function
        return () => {
            console.log('Cleaning up auto-run interval')
            clearInterval(interval)
        }
    }

    // Clean up WebSocket on component unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [])

    // Save the current simulation recording
    const saveRecording = async () => {
        if (!simulationId) return;

        try {
            setStatus('saving');
            const response = await axios.post(`/api/simulate/${simulationId}/save-recording`);

            if (response.data && response.data.status === 'success') {
                setRecordingSaved(true);
                alert(`Recording saved successfully with ID: ${response.data.recording_id}`);
            } else {
                alert(`Error saving recording: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving recording:', error);
            alert('Failed to save recording. See console for details.');
        } finally {
            setStatus(status === 'saving' ? (currentStep >= totalSteps ? 'completed' : 'running') : status);
        }
    }

    // Adjustment warning component to display when values are adjusted
    const AdjustmentWarning = ({ adjustments }: { adjustments: any }) => {
        if (!adjustments) return null;

        const { original_values, adjusted_values, adjustment_reason } = adjustments;

        if (!original_values || !adjusted_values) return null;

        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Simulation Value Adjustments</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>{adjustment_reason}</p>
                            <div className="mt-2">
                                <h4 className="text-xs font-medium mb-1">Original Values</h4>
                                <ul className="list-disc pl-5 space-y-1 text-xs">
                                    {original_values.initial_prey !== undefined && (
                                        <li>Initial Prey: {original_values.initial_prey}</li>
                                    )}
                                    {original_values.initial_predators !== undefined && (
                                        <li>Initial Predators: {original_values.initial_predators}</li>
                                    )}
                                    {original_values.initial_substrate_prob !== undefined && (
                                        <li>Substrate Probability: {original_values.initial_substrate_prob}</li>
                                    )}
                                </ul>
                            </div>
                            <div className="mt-2">
                                <h4 className="text-xs font-medium mb-1">Adjusted Values</h4>
                                <ul className="list-disc pl-5 space-y-1 text-xs">
                                    {adjusted_values.initial_prey !== undefined && (
                                        <li>Initial Prey: {adjusted_values.initial_prey}</li>
                                    )}
                                    {adjusted_values.actual_prey_count !== undefined && (
                                        <li>Actual Prey Placed: {adjusted_values.actual_prey_count}</li>
                                    )}
                                    {adjusted_values.initial_predators !== undefined && (
                                        <li>Initial Predators: {adjusted_values.initial_predators}</li>
                                    )}
                                    {adjusted_values.actual_predator_count !== undefined && (
                                        <li>Actual Predators Placed: {adjusted_values.actual_predator_count}</li>
                                    )}
                                    {adjusted_values.initial_substrate_prob !== undefined && (
                                        <li>Substrate Probability: {adjusted_values.initial_substrate_prob}</li>
                                    )}
                                    {adjusted_values.actual_substrate_count !== undefined && (
                                        <li>Actual Substrate Cells: {adjusted_values.actual_substrate_count}</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Head>
                <title>Run Simulation - modCA_7</title>
                <meta name="description" content="Configure and run a cellular automata simulation" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <style jsx global>{`
                .btn-primary {
                    background-color: #6B7280;
                    color: white;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    transition: background-color 0.2s;
                }
                .btn-primary:hover {
                    background-color: #4B5563;
                }
                .btn-secondary {
                    background-color: #9CA3AF;
                    color: white;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    transition: background-color 0.2s;
                }
                .btn-secondary:hover {
                    background-color: #6B7280;
                }
                .btn-success {
                    background-color: #6B7280;
                    color: white;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    transition: background-color 0.2s;
                }
                .btn-success:hover {
                    background-color: #4B5563;
                }
                .btn-warning {
                    background-color: #9CA3AF;
                    color: white;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    transition: background-color 0.2s;
                }
                .btn-warning:hover {
                    background-color: #6B7280;
                }
            `}</style>

            {isGridFullscreen && (
                <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center p-2">
                    <div className="relative w-full h-full">
                        <button
                            className="absolute top-2 right-2 z-10 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                            onClick={toggleGridFullscreen}
                        >
                            Exit Fullscreen
                        </button>

                        {/* Zoom controls */}
                        {grid.length > LARGE_GRID_THRESHOLD && (
                            <div className="absolute top-2 left-2 z-10 flex space-x-2">
                                <button
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 20))}
                                >
                                    Zoom In
                                </button>
                                <button
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}
                                >
                                    Zoom Out
                                </button>
                                <button
                                    className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700"
                                    onClick={() => {
                                        setZoomLevel(1);
                                        setViewportOffset({ x: 0, y: 0 });
                                    }}
                                >
                                    Reset View
                                </button>
                            </div>
                        )}

                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <h2 className="text-xl text-white mb-2">Grid Visualization (Step {currentStep})</h2>
                            <div className="w-full h-[calc(100%-40px)] flex items-center justify-center">
                                <canvas
                                    ref={canvasRef}
                                    className="max-w-full max-h-full bg-gray-800"
                                ></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                {/* Fixed top navigation bar with buttons */}
                {simulationId && (
                    <div className="sticky top-0 z-40 bg-white dark:bg-dark-card shadow-md p-3 mb-4">
                        <div className="container mx-auto max-w-7xl flex flex-wrap items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text">
                                    Simulation #{simulationId}
                                </h2>
                                <div className="flex items-center">
                                    <span className="text-gray-600 dark:text-gray-300 mr-2">
                                        Step {currentStep} of {totalSteps}
                                    </span>
                                    <div className={`h-3 w-3 rounded-full ${status === 'running' ? 'bg-green-500' :
                                        status === 'completed' ? 'bg-blue-500' :
                                            status === 'stopped' ? 'bg-red-500' :
                                                status.startsWith('retrying') ? 'bg-purple-500 animate-pulse' :
                                                    'bg-yellow-500'
                                        }`}></div>
                                    <span className="ml-2 text-sm capitalize dark:text-gray-300">
                                        {status.startsWith('retrying') ? 'Retrying connection...' : status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                                <button
                                    type="button"
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                    onClick={() => router.push("/")}
                                    title="Return to Home"
                                >
                                    Home
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                    onClick={() => stepSimulation(1)}
                                    disabled={status === 'completed' || !simulationId}
                                >
                                    Step (1)
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                    onClick={() => stepSimulation(5)}
                                    disabled={status === 'completed' || !simulationId}
                                >
                                    Step (5)
                                </button>
                                <button
                                    type="button"
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                    onClick={autoRunSimulation}
                                    disabled={status === 'completed' || !simulationId}
                                >
                                    Auto Run
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                    onClick={resetSimulation}
                                    disabled={!simulationId}
                                >
                                    Reset
                                </button>
                                {simulationId && recordingAvailable && !recordingSaved && (
                                    <button
                                        type="button"
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                        onClick={() => saveRecording()}
                                    >
                                        Save Recording
                                    </button>
                                )}
                                {isGridFullscreen ? (
                                    <button
                                        type="button"
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                        onClick={toggleGridFullscreen}
                                    >
                                        Exit Fullscreen
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                        onClick={toggleGridFullscreen}
                                    >
                                        Fullscreen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Display adjustment warning if values were adjusted */}
                {simulationId && valueAdjustments && valueAdjustments.values_adjusted && (
                    <div className="container mx-auto max-w-7xl mb-4">
                        <AdjustmentWarning adjustments={valueAdjustments} />
                    </div>
                )}

                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {!simulationId ? (
                        <>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-6">Set simulation baby and let's roll</h1>
                            <div className="card p-6 mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-4">Configure Simulation</h2>

                                <Formik
                                    initialValues={defaultSettings}
                                    validationSchema={SimulationSchema}
                                    enableReinitialize={true}
                                    onSubmit={(values, { setSubmitting }) => {
                                        // Convert all form values explicitly before calling startSimulation
                                        const numericValues = {
                                            ...values,
                                            grid_size: Number(values.grid_size),
                                            steps: Number(values.steps),
                                            initial_prey: Number(values.initial_prey),
                                            initial_predators: Number(values.initial_predators),
                                            predator_death_probability: Number(values.predator_death_probability),
                                            predator_birth_probability: Number(values.predator_birth_probability),
                                            predator_starvation_steps: Number(values.predator_starvation_steps),
                                            prey_hunted_probability: Number(values.prey_hunted_probability),
                                            prey_random_death: Number(values.prey_random_death),
                                            prey_birth_probability: Number(values.prey_birth_probability),
                                            prey_starvation_steps: Number(values.prey_starvation_steps),
                                            initial_substrate_probability: Number(values.initial_substrate_probability),
                                            substrate_random_death: Number(values.substrate_random_death),
                                            substrate_consumption_prob: Number(values.substrate_consumption_prob),
                                            neighborhood_type: values.neighborhood_type,
                                            grid_type: values.grid_type
                                        };
                                        console.log('Form submission - converted numeric values:', numericValues);

                                        // Save settings to localStorage before starting simulation
                                        saveSettingsToLocalStorage(numericValues);

                                        startSimulation(numericValues);
                                        setSubmitting(false);
                                    }}
                                >
                                    {({ isSubmitting }) => (
                                        <Form className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label htmlFor="grid_size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grid Size</label>
                                                    <Field
                                                        type="number"
                                                        name="grid_size"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="grid_size" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Steps</label>
                                                    <Field
                                                        type="number"
                                                        name="steps"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="steps" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="neighborhood_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Neighborhood Type</label>
                                                    <Field
                                                        as="select"
                                                        name="neighborhood_type"
                                                        className="input"
                                                    >
                                                        <option value="von_neumann">Von Neumann (4 cells)</option>
                                                        <option value="moore">Moore (8 cells)</option>
                                                    </Field>
                                                    <ErrorMessage name="neighborhood_type" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="grid_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grid Type</label>
                                                    <Field
                                                        as="select"
                                                        name="grid_type"
                                                        className="input"
                                                    >
                                                        <option value="finite">Finite</option>
                                                        <option value="torus">Torus</option>
                                                    </Field>
                                                    <ErrorMessage name="grid_type" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div className="col-span-3 border-t pt-4 mt-2">
                                                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-2">Predator Parameters</h3>
                                                </div>

                                                <div>
                                                    <label htmlFor="initial_predators" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Predators</label>
                                                    <Field
                                                        type="number"
                                                        name="initial_predators"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="initial_predators" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="predator_death_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Death Probability</label>
                                                    <Field
                                                        type="number"
                                                        name="predator_death_probability"
                                                        step="0.01"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="predator_death_probability" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="predator_birth_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birth Probability</label>
                                                    <Field
                                                        type="number"
                                                        name="predator_birth_probability"
                                                        step="0.01"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="predator_birth_probability" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="predator_starvation_steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Starvation Steps</label>
                                                    <Field
                                                        type="number"
                                                        name="predator_starvation_steps"
                                                        className="input"
                                                    />
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Steps a predator can survive without food</div>
                                                    <ErrorMessage name="predator_starvation_steps" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div className="col-span-3 border-t pt-4 mt-2">
                                                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-2">Prey Parameters</h3>
                                                </div>

                                                <div>
                                                    <label htmlFor="initial_prey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Prey</label>
                                                    <Field
                                                        type="number"
                                                        name="initial_prey"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="initial_prey" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="prey_hunted_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hunted Probability</label>
                                                    <Field
                                                        type="number"
                                                        name="prey_hunted_probability"
                                                        step="0.01"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="prey_hunted_probability" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="prey_random_death" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Random Death Probability</label>
                                                    <Field
                                                        type="number"
                                                        name="prey_random_death"
                                                        step="0.01"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="prey_random_death" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="prey_birth_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birth Probability</label>
                                                    <Field
                                                        type="number"
                                                        name="prey_birth_probability"
                                                        step="0.01"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="prey_birth_probability" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="prey_starvation_steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Starvation Steps</label>
                                                    <Field
                                                        type="number"
                                                        name="prey_starvation_steps"
                                                        className="input"
                                                    />
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Steps a prey can survive without substrate</div>
                                                    <ErrorMessage name="prey_starvation_steps" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div className="col-span-3 border-t pt-4 mt-2">
                                                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-2">Substrate Parameters</h3>
                                                </div>

                                                <div>
                                                    <label htmlFor="initial_substrate_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Probability</label>
                                                    <Field
                                                        type="number"
                                                        name="initial_substrate_probability"
                                                        step="0.01"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="initial_substrate_probability" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="substrate_random_death" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Random Death Probability</label>
                                                    <Field
                                                        type="number"
                                                        name="substrate_random_death"
                                                        step="0.01"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="substrate_random_death" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="substrate_consumption_prob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Consumption Probability</label>
                                                    <Field
                                                        type="number"
                                                        name="substrate_consumption_prob"
                                                        step="0.01"
                                                        className="input"
                                                    />
                                                    <ErrorMessage name="substrate_consumption_prob" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="record_simulation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Record Simulation
                                                    </label>
                                                    <div className="mt-1 flex items-center">
                                                        <Field
                                                            type="checkbox"
                                                            name="record_simulation"
                                                            id="record_simulation"
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                            Enable to save each step for smoother playback later
                                                        </span>
                                                    </div>
                                                    <ErrorMessage name="record_simulation" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push('/')}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Reset to factory defaults
                                                        setDefaultSettings(hardcodedDefaults);
                                                        saveSettingsToLocalStorage(hardcodedDefaults);
                                                        // Reload the page to apply defaults
                                                        window.location.reload();
                                                    }}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                                >
                                                    Reset to Defaults
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70"
                                                >
                                                    {isSubmitting ? 'Starting...' : 'Start Simulation'}
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="card p-6">
                                <div className="flex flex-wrap -mx-2">
                                    <div className="w-full lg:w-1/2 px-2 mb-4">
                                        <div className="border dark:border-dark-border rounded-md p-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text">Grid Visualization</h3>
                                                <button
                                                    className="btn-secondary text-sm px-2 py-1"
                                                    onClick={toggleGridFullscreen}
                                                >
                                                    Fullscreen
                                                </button>
                                            </div>
                                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 border rounded-md overflow-hidden">
                                                <canvas
                                                    ref={canvasRef}
                                                    width={400}
                                                    height={400}
                                                    className="w-full h-full bg-gray-100 dark:bg-gray-800"
                                                ></canvas>
                                            </div>
                                            {grid.length > 100 && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Large grid ({grid.length}x{grid.length}). Use fullscreen for better visibility.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full lg:w-1/2 px-2 mb-4">
                                        <div className="border dark:border-dark-border rounded-md p-2">
                                            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-2">Population Trends</h3>
                                            <div className="aspect-square bg-white dark:bg-dark-card">
                                                <Line
                                                    data={chartData}
                                                    options={{
                                                        responsive: true,
                                                        plugins: {
                                                            legend: {
                                                                position: 'top',
                                                                labels: {
                                                                    color: document.documentElement.classList.contains('dark') ? '#E0E0E0' : undefined
                                                                }
                                                            },
                                                            title: {
                                                                display: true,
                                                                text: 'Population Over Time',
                                                                color: document.documentElement.classList.contains('dark') ? '#E0E0E0' : undefined
                                                            },
                                                        },
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                ticks: {
                                                                    color: document.documentElement.classList.contains('dark') ? '#E0E0E0' : undefined
                                                                },
                                                                grid: {
                                                                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : undefined
                                                                }
                                                            },
                                                            x: {
                                                                ticks: {
                                                                    color: document.documentElement.classList.contains('dark') ? '#E0E0E0' : undefined
                                                                },
                                                                grid: {
                                                                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : undefined
                                                                }
                                                            }
                                                        },
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-2">Current Statistics</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                                            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Predators</div>
                                            <div className="text-2xl font-bold text-red-800 dark:text-red-300">{statistics.predator_count || 0}</div>
                                        </div>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                                            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Prey</div>
                                            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{statistics.prey_count || 0}</div>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                                            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Substrate</div>
                                            <div className="text-2xl font-bold text-green-800 dark:text-green-300">{statistics.substrate_count || 0}</div>
                                        </div>
                                    </div>
                                </div>

                                {status === 'error' && (
                                    <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded">
                                        An error occurred. Please check the console for details or try again.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    )
} 