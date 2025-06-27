import { useState, useEffect, useRef, useCallback } from 'react'
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
import {
    COLORS,
    CHART_COLORS,
    LARGE_GRID_THRESHOLD,
    DEFAULT_SIMULATION_SETTINGS,
    PREDATOR,
    PREY,
    SUBSTRATE,
    GRID_SIZE,
    STEPS,
    INITIAL_PREY,
    INITIAL_PREDATORS,
    PREDATOR_DEATH_PROBABILITY,
    PREDATOR_BIRTH_PROBABILITY,
    PREDATOR_STARVATION_STEPS,
    PREY_HUNTED_PROBABILITY,
    PREY_RANDOM_DEATH,
    PREY_BIRTH_PROBABILITY,
    PREY_STARVATION_STEPS,
    INITIAL_SUBSTRATE_PROBABILITY,
    SUBSTRATE_RANDOM_DEATH,
    SUBSTRATE_CONSUMPTION_PROB,
    NEIGHBORHOOD_TYPE,
    GRID_TYPE,
    VALIDATION_LIMITS,
    PREY_THREAT_RESPONSE
} from '../constants'
import { ChartData, ChartDataset, Statistics, SimulationParams, SimulationStatus } from '../types'
import { fontFamily } from '@/styles/fonts'
import { getApiUrl, getWsUrl } from '../utils/env'
import React from 'react';
import Link from 'next/link';
import { showNotification } from '../utils/notification';
import { SimulationSetup } from '../components/SimulationSetup';
import { RunningSimulation } from '../components/RunningSimulation';

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

// Configure Chart.js defaults to not show zero lines
ChartJS.defaults.datasets.line.spanGaps = true;
ChartJS.defaults.elements.line.borderWidth = 2;

const inter = Inter({ subsets: ['latin'] })

// Define the validation schema
const SimulationSchema = Yup.object().shape({
    grid_size: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.GRID_SIZE.min, `Must be at least ${VALIDATION_LIMITS.GRID_SIZE.min}`)
        .max(VALIDATION_LIMITS.GRID_SIZE.max, `Must be at most ${VALIDATION_LIMITS.GRID_SIZE.max}`),
    steps: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.STEPS.min, `Must be at least ${VALIDATION_LIMITS.STEPS.min}`)
        .max(VALIDATION_LIMITS.STEPS.max, `Must be at most ${VALIDATION_LIMITS.STEPS.max}`),
    neighborhood_type: Yup.string()
        .required('Required'),
    grid_type: Yup.string()
        .required('Required'),
    predator_death_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.max}`),
    predator_birth_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.max}`),
    initial_predators: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.INITIAL_PREDATORS.min, `Must be at least ${VALIDATION_LIMITS.INITIAL_PREDATORS.min}`)
        .max(VALIDATION_LIMITS.INITIAL_PREDATORS.max, `Must be at most ${VALIDATION_LIMITS.INITIAL_PREDATORS.max}`),
    predator_starvation_steps: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.min, `Must be at least ${VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.min}`)
        .max(VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.max, `Must be at most ${VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.max}`),
    prey_hunted_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.max}`),
    prey_random_death: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_RANDOM_DEATH.min, `Must be at least ${VALIDATION_LIMITS.PREY_RANDOM_DEATH.min}`)
        .max(VALIDATION_LIMITS.PREY_RANDOM_DEATH.max, `Must be at most ${VALIDATION_LIMITS.PREY_RANDOM_DEATH.max}`),
    initial_prey: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.INITIAL_PREY.min, `Must be at least ${VALIDATION_LIMITS.INITIAL_PREY.min}`)
        .max(VALIDATION_LIMITS.INITIAL_PREY.max, `Must be at most ${VALIDATION_LIMITS.INITIAL_PREY.max}`),
    prey_birth_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.max}`),
    prey_starvation_steps: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_STARVATION_STEPS.min, `Must be at least ${VALIDATION_LIMITS.PREY_STARVATION_STEPS.min}`)
        .max(VALIDATION_LIMITS.PREY_STARVATION_STEPS.max, `Must be at most ${VALIDATION_LIMITS.PREY_STARVATION_STEPS.max}`),
    prey_threat_response: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_THREAT_RESPONSE.min, `Must be at least ${VALIDATION_LIMITS.PREY_THREAT_RESPONSE.min}`)
        .max(VALIDATION_LIMITS.PREY_THREAT_RESPONSE.max, `Must be at most ${VALIDATION_LIMITS.PREY_THREAT_RESPONSE.max}`),
    initial_substrate_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.max}`),
    substrate_random_death: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.min, `Must be at least ${VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.min}`)
        .max(VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.max, `Must be at most ${VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.max}`),
    substrate_consumption_prob: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.min, `Must be at least ${VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.min}`)
        .max(VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.max, `Must be at most ${VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.max}`),
})

export default function Simulate() {
    const router = useRouter()
    const [simulationId, setSimulationId] = useState<string | null>(null)
    const [status, setStatus] = useState<SimulationStatus>('setup')  // Start with setup status
    const [currentStep, setCurrentStep] = useState<number>(0)
    const [totalSteps, setTotalSteps] = useState<number>(0)
    const [grid, setGrid] = useState<number[][]>([])
    const [statistics, setStatistics] = useState<any>({})
    const [isGridFullscreen, setIsGridFullscreen] = useState<boolean>(false)
    const [isChartFullscreen, setIsChartFullscreen] = useState<boolean>(false)
    const [chartData, setChartData] = useState<any>({
        labels: [],
        datasets: [
            {
                label: 'Predators',
                data: [],
                borderColor: CHART_COLORS[PREDATOR].border,
                backgroundColor: CHART_COLORS[PREDATOR].background,
                tension: 0.1
            },
            {
                label: 'Prey',
                data: [],
                borderColor: CHART_COLORS[PREY].border,
                backgroundColor: CHART_COLORS[PREY].background,
                tension: 0.1
            },
            {
                label: 'Substrate',
                data: [],
                borderColor: CHART_COLORS[SUBSTRATE].border,
                backgroundColor: CHART_COLORS[SUBSTRATE].background,
                tension: 0.1
            },
            {
                label: 'Total',
                data: [],
                borderColor: 'rgba(150, 150, 150, 1)',
                backgroundColor: 'rgba(150, 150, 150, 0.5)',
                tension: 0.1,
                borderWidth: 3
            }
        ]
    })

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const [wsConnected, setWsConnected] = useState<boolean>(false)

    // Load saved settings from localStorage or use defaults
    const [defaultSettings, setDefaultSettings] = useState(DEFAULT_SIMULATION_SETTINGS);

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
    const saveSettingsToLocalStorage = (settings: SimulationParams) => {
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

    // Toggle fullscreen mode for the chart
    const toggleChartFullscreen = () => {
        setIsChartFullscreen(!isChartFullscreen);
    };

    // Update chart with new statistics
    useEffect(() => {
        if (!statistics || !statistics.predator_count) return

        // Skip adding data points when simulation hasn't started yet (step 0)
        if (currentStep === 0) return

        setChartData((prev: ChartData) => {
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
                    {
                        ...prev.datasets[3],
                        data: [...prev.datasets[3].data, statistics.predator_count + statistics.prey_count + statistics.substrate_count],
                    },
                ],
            }
        })
    }, [statistics, currentStep])

    // Start a new simulation
    const startSimulation = async (values: SimulationParams) => {
        try {
            // Set loading state immediately
            setStatus('loading')

            // Validate grid size
            if (Number(values.grid_size) > 400) {
                showNotification('Grid size cannot exceed 400x400');
                setStatus('setup')
                return;
            }

            // Validate total entities
            const totalCells = Number(values.grid_size) * Number(values.grid_size);
            const totalEntities = Number(values.initial_predators) + Number(values.initial_prey);

            if (totalEntities > totalCells) {
                showNotification(`Total number of predators (${values.initial_predators}) and prey (${values.initial_prey}) cannot exceed the total number of cells (${totalCells})`);
                setStatus('setup')
                return;
            }

            // For large grids, show a non-blocking notification
            if (Number(values.grid_size) >= 200) {
                showNotification(
                    `Large grid (${values.grid_size}×${values.grid_size}). Use fullscreen mode for better performance.`
                );
            }

            console.log('Starting simulation with raw form values:', values)

            // Calculate dynamic timeout based on grid size
            const gridSizeSquared = Number(values.grid_size) * Number(values.grid_size);
            // Base timeout of 30 seconds, plus 1 second per 10,000 cells
            const dynamicTimeout = 30000 + Math.floor(gridSizeSquared / 10000) * 1000;
            console.log(`Using dynamic timeout of ${dynamicTimeout}ms for grid size ${values.grid_size}`);

            // Validate values before sending to server
            const validatedValues = {
                ...values,
                // Convert all values to numbers with fallbacks
                grid_size: Number(values.grid_size) || GRID_SIZE,
                steps: Number(values.steps) || STEPS,
                initial_prey: Number(values.initial_prey) || INITIAL_PREY,
                initial_predators: Number(values.initial_predators) || INITIAL_PREDATORS,
                predator_death_probability: Number(values.predator_death_probability) || PREDATOR_DEATH_PROBABILITY,
                predator_birth_probability: Number(values.predator_birth_probability) || PREDATOR_BIRTH_PROBABILITY,
                predator_starvation_steps: Number(values.predator_starvation_steps) || PREDATOR_STARVATION_STEPS,
                prey_hunted_probability: Number(values.prey_hunted_probability) || PREY_HUNTED_PROBABILITY,
                prey_random_death: Number(values.prey_random_death) || PREY_RANDOM_DEATH,
                prey_birth_probability: Number(values.prey_birth_probability) || PREY_BIRTH_PROBABILITY,
                prey_starvation_steps: Number(values.prey_starvation_steps) || PREY_STARVATION_STEPS,
                prey_threat_response: Number(values.prey_threat_response) || PREY_THREAT_RESPONSE,
                initial_substrate_probability: Number(values.initial_substrate_probability) || INITIAL_SUBSTRATE_PROBABILITY,
                substrate_random_death: Number(values.substrate_random_death) || SUBSTRATE_RANDOM_DEATH,
                substrate_consumption_prob: Number(values.substrate_consumption_prob) || SUBSTRATE_CONSUMPTION_PROB,
                neighborhood_type: values.neighborhood_type || NEIGHBORHOOD_TYPE,
                grid_type: values.grid_type || GRID_TYPE,
                record_simulation: Boolean(values.record_simulation)
            };

            // Save the settings to localStorage for future use
            saveSettingsToLocalStorage(validatedValues);

            // Add timeout to axios request to prevent hanging indefinitely
            try {
                console.log('Sending request to /api/simulate with payload:', validatedValues);
                console.log('API URL:', getApiUrl() || 'Using relative URL');

                const response = await axios.post(`${getApiUrl()}/simulate`, validatedValues, {
                    timeout: dynamicTimeout,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                console.log('Raw response from backend:', response)
                console.log('Simulation started successfully, response data:', response.data)

                if (!response.data || !response.data.simulation_id) {
                    throw new Error('Invalid response from server - missing simulation ID')
                }

                const { simulation_id, status, current_step, total_steps, grid, statistics, adjustments } = response.data

                // Ensure all required data is present
                if (!simulation_id || !grid || !statistics) {
                    console.error('Invalid or incomplete simulation data received:', response.data)
                    throw new Error('Incomplete simulation data received from server')
                }

                // Set all the state values
                setSimulationId(simulation_id)
                setStatus('ready')  // Set to ready instead of using status from response
                setCurrentStep(current_step)
                setTotalSteps(total_steps)
                setGrid(grid)
                setStatistics(statistics)

                // Store adjustment information if present
                if (adjustments && adjustments.values_adjusted) {
                    console.log("Values were adjusted during initialization:", adjustments);
                    setValueAdjustments(adjustments);
                    // Show a non-blocking notification about adjustments
                    showNotification('Some simulation values were adjusted to fit the grid size.');
                }

                // Check if recording is enabled and reset recording status
                setRecordingAvailable(validatedValues.record_simulation);
                setRecordingSaved(false);

                console.log(`Simulation ${simulation_id} started at step ${current_step} of ${total_steps}`)

                // Reset chart data
                setChartData({
                    labels: [],
                    datasets: [
                        {
                            label: 'Predators',
                            data: [],
                            borderColor: CHART_COLORS[PREDATOR].border,
                            backgroundColor: CHART_COLORS[PREDATOR].background,
                            tension: 0.1
                        },
                        {
                            label: 'Prey',
                            data: [],
                            borderColor: CHART_COLORS[PREY].border,
                            backgroundColor: CHART_COLORS[PREY].background,
                            tension: 0.1
                        },
                        {
                            label: 'Substrate',
                            data: [],
                            borderColor: CHART_COLORS[SUBSTRATE].border,
                            backgroundColor: CHART_COLORS[SUBSTRATE].background,
                            tension: 0.1
                        },
                        {
                            label: 'Total',
                            data: [],
                            borderColor: 'rgba(150, 150, 150, 1)',
                            backgroundColor: 'rgba(150, 150, 150, 0.5)',
                            tension: 0.1,
                            borderWidth: 3
                        }
                    ],
                })

                // Connect to WebSocket and start simulation immediately
                connectWebSocket(simulation_id)
                setTimeout(() => {
                    if (status !== 'completed') {
                        autoRunSimulation()
                    }
                }, 500)

            } catch (axiosError: any) {
                console.error('Axios error starting simulation:', axiosError)

                // Handle timeout errors specifically
                if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ECONNRESET') {
                    setStatus('setup')
                    showNotification('Connection timeout. Try reducing the grid size or check your connection.')
                    return
                }

                // Special handling for common error cases
                if (axiosError.response?.status === 500) {
                    // Check for specific error messages
                    const errorDetail = axiosError.response.data?.detail || '';
                    let errorMessage = 'Server error occurred. ';

                    if (errorDetail.includes('grid initialization failed')) {
                        errorMessage += 'Try reducing grid size or entity counts.'
                    } else if (errorDetail.includes('simulation initialization failed')) {
                        errorMessage += 'Try with different parameters.'
                    }

                    showNotification(errorMessage)
                } else {
                    // For other error types
                    showNotification('Error starting simulation. Please try again.')
                }
                setStatus('setup')
            }

        } catch (error: any) {
            console.error('General error during simulation start:', error)
            setStatus('setup')
            showNotification('An unexpected error occurred. Please try again.')
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

            handleSettingsError(errorMessage)

            // Show more detailed debugging info in the console
            if (error.response.status === 500) {
                console.error('Server error (500). Please check server logs for more details.');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request)
            handleWebSocketError(message, error)
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message)
            handleWebSocketError(message, error)
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
        const wsUrl = getWsUrl() + '/simulate/' + simId

        console.log(`WebSocket URL: ${wsUrl}`)

        try {
            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            // Add connection timeout
            const connectionTimeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.error('WebSocket connection timeout')
                    ws.close()
                    setStatus('error')
                    showNotification('Connection issue. Retrying...')
                    // Try to reconnect
                    setTimeout(() => connectWebSocket(simId), 2000)
                }
            }, 10000) // 10 second timeout

            ws.onopen = () => {
                console.log('WebSocket connection established')
                clearTimeout(connectionTimeout)
                setWsConnected(true)
                setStatus('ready')
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    console.log('WebSocket message:', data)

                    if (data.error) {
                        console.error('WebSocket error:', data.error)
                        setStatus('error')
                        // Only show notification for non-connection errors
                        if (!data.error.includes('connection')) {
                            showNotification(`Simulation error: ${data.error}`)
                        }
                        return
                    }

                    // Handle simulation updates
                    if (data.grid && data.statistics) {
                        setStatus(data.status)
                        setCurrentStep(data.current_step)
                        setTotalSteps(data.total_steps)

                        // Batch state updates using a single setState call
                        const newState = {
                            grid: data.grid,
                            statistics: data.statistics,
                            chartData: (prevData: ChartData) => {
                                // Skip adding data for step 0
                                if (data.current_step === 0) return prevData;

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
                                        {
                                            ...prevData.datasets[3],
                                            data: [...prevData.datasets[3].data, data.statistics.predator_count + data.statistics.prey_count + data.statistics.substrate_count],
                                        },
                                    ],
                                }
                            }
                        }

                        // Update state in a single batch
                        setGrid(newState.grid)
                        setStatistics(newState.statistics)
                        setChartData(newState.chartData)
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error)
                    // Don't show notification for parsing errors, just log them
                }
            }

            ws.onclose = (event) => {
                console.log(`WebSocket closed with code ${event.code}`)
                clearTimeout(connectionTimeout)
                setWsConnected(false)

                // Try to reconnect if connection was lost unexpectedly
                if (event.code !== 1000 && event.code !== 1001) {
                    console.log('Attempting to reconnect WebSocket in 2 seconds...')
                    // Only show notification if we're not already in error state
                    if (status !== 'error') {
                        showNotification('Connection lost. Reconnecting...')
                    }
                    setTimeout(() => connectWebSocket(simId), 2000)
                }
            }

            ws.onerror = (event) => {
                console.error('WebSocket error:', event)
                clearTimeout(connectionTimeout)
                setWsConnected(false)
                setStatus('error')
                // Don't show notification for WebSocket errors, they're usually followed by onclose
            }

            // Send a ping to ensure connection is working
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    sendWsCommand('ping')
                }
            }, 1000)

        } catch (error) {
            console.error('Error creating WebSocket connection:', error)
            setStatus('error')
            // Don't show notification, let the reconnection handle it
            setTimeout(() => connectWebSocket(simId), 2000)
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
            // Create an AbortController for the request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            // Step the simulation via REST API
            axios.post(`${getApiUrl()}/simulate/${simulationId}/step?steps=${steps}`, {}, {
                timeout: timeout,
                signal: controller.signal
            })
                .then(response => {
                    clearTimeout(timeoutId);
                    console.log('Step complete, response:', response.data)
                    const { status, current_step, grid, statistics } = response.data

                    // Batch state updates
                    const updates = () => {
                        setStatus(status as SimulationStatus)
                        setCurrentStep(current_step)
                        setGrid(grid)
                        setStatistics(statistics)
                    }

                    // Use requestAnimationFrame to avoid blocking the UI
                    requestAnimationFrame(updates)
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    console.error('Error stepping simulation:', error)

                    // Check if we should retry
                    if (retryCount < maxRetries &&
                        (error.code === 'ECONNABORTED' ||
                            error.code === 'ECONNRESET' ||
                            !error.response ||
                            error.name === 'AbortError')) {

                        retryCount++;
                        console.log(`Connection issue detected. Retry attempt ${retryCount}/${maxRetries}...`);

                        // Wait a bit longer between each retry
                        const retryDelay = 3000 * retryCount;
                        showNotification(`Connection issue. Retrying in ${retryDelay / 1000} seconds...`)
                        setTimeout(() => {
                            attemptStep();
                        }, retryDelay);

                        // Show a non-blocking message to the user about the retry
                        setStatus(retryCount === 1 ? 'retrying-1' : retryCount === 2 ? 'retrying-2' : 'retrying-3');

                        // Don't show full error dialog during retries
                        return;
                    }

                    // If we've exhausted retries or it's another type of error, handle normally
                    handleAxiosError(error, 'Failed to step simulation');

                    if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET' || error.name === 'AbortError') {
                        // For timeout/connection errors with large grids, provide more helpful message
                        if (isLargeGrid) {
                            handleLargeGridWarning(gridSize)
                        } else {
                            showNotification('Step timed out. Try reducing the grid size or number of steps.')
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
        if (!simulationId || status === 'completed' || status === 'stopped' || status === 'error') {
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

        // Use requestAnimationFrame for smoother updates
        let animationFrameId: number;
        let lastStepTime = 0;

        const runStep = (timestamp: number) => {
            // Check if enough time has passed since the last step
            if (timestamp - lastStepTime >= stepInterval) {
                // Check if we're in a retry or error state
                const isRetrying = status === 'retrying-1' || status === 'retrying-2' || status === 'retrying-3';
                const isErrorState = status === ('error' as SimulationStatus);
                if (isRetrying || isErrorState) {
                    consecutiveFailures++;
                    console.log(`Auto-run detected error/retry state (${consecutiveFailures}/${maxConsecutiveFailures})`)

                    // If we've had too many consecutive failures, stop auto-run
                    if (consecutiveFailures >= maxConsecutiveFailures) {
                        console.log('Too many consecutive failures, stopping auto-run')
                        handleConnectionIssues()
                        return
                    }

                    // Skip this step and continue
                    lastStepTime = timestamp;
                } else {
                    // We had a successful step, reset the failure counter
                    consecutiveFailures = 0

                    // Check current state to decide whether to continue
                    if (currentStep >= totalSteps) {
                        console.log('Auto-run complete: reached total steps')
                        setStatus('completed' as SimulationStatus)
                        return
                    }

                    // Also check if we're already in a loading state
                    if (status === ('loading' as SimulationStatus)) {
                        console.log('Skipping auto-run step: simulation is still processing previous step')
                    } else {
                        // Use standard stepping method with just 1 step at a time for better reliability
                        stepSimulation(1)
                    }

                    lastStepTime = timestamp;
                }
            }

            // Schedule next frame unless we're done
            if (currentStep < totalSteps && status !== ('completed' as SimulationStatus)) {
                animationFrameId = requestAnimationFrame(runStep);
            }
        };

        // Start the animation loop
        animationFrameId = requestAnimationFrame(runStep);

        // Return cleanup function
        return () => {
            console.log('Cleaning up auto-run animation frame')
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }
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
                handleRecordingSaved(response.data.recording_id);
            } else {
                handleRecordingError(response.data);
            }
        } catch (error) {
            console.error('Error saving recording:', error);
            handleRecordingError(error);
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

    // Helper function to calculate trend over last 10 steps
    const calculateTrend = (dataset: number[], maxSteps = 10) => {
        if (dataset.length < 2) return 'stable';

        const pointsToConsider = Math.min(maxSteps, dataset.length);
        const recentPoints = dataset.slice(-pointsToConsider);

        // Simple linear regression
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        const n = recentPoints.length;

        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += recentPoints[i];
            sumXY += i * recentPoints[i];
            sumXX += i * i;
        }

        // Calculate slope
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

        // Determine trend based on slope
        if (Math.abs(slope) < 0.5) return 'stable';
        return slope > 0 ? 'increasing' : 'decreasing';
    };

    const styles = {
        main: {
            fontFamily,
            // ... existing code ...
        }
    }

    // Add this function near the other utility functions
    const loadSettingsFromLocalStorage = () => {
        try {
            const savedSettings = localStorage.getItem('simulationSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                console.log('Loaded saved settings from localStorage:', parsedSettings);
                setDefaultSettings(parsedSettings);
                // Update form values without reloading the page
                if (formikRef.current) {
                    formikRef.current.setValues(parsedSettings);
                }
            } else {
                alert('No saved settings found');
            }
        } catch (error) {
            console.error('Error loading saved settings:', error);
            alert('Error loading saved settings');
        }
    };

    // Add formikRef near the top of the component with other refs
    const formikRef = useRef<any>(null);

    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
    const [isLoadModalOpen, setIsLoadModalOpen] = React.useState(false);
    const [settings, setSettings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Load settings when component mounts
    React.useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${getApiUrl()}/settings`);
            if (!response.ok) {
                throw new Error('Failed to load settings');
            }
            const data = await response.json();
            setSettings(data.settings);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load settings');
            console.error('Error loading settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (name: string, description: string) => {
        try {
            const response = await fetch(`${getApiUrl()}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    description,
                    ...formikRef.current.values,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            setIsSaveModalOpen(false);
            // Reload settings list
            await loadSettings();
            // Show success message
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        }
    };

    const NUMERIC_FIELDS = [
        'grid_size', 'steps', 'initial_prey', 'initial_predators',
        'predator_death_probability', 'predator_birth_probability', 'predator_starvation_steps',
        'prey_hunted_probability', 'prey_random_death', 'prey_birth_probability',
        'prey_starvation_steps', 'prey_threat_response',
        'initial_substrate_probability', 'substrate_random_death', 'substrate_consumption_prob'
    ];

    const handleLoadSettings = (settings: SimulationParams) => {
        const normalized = Object.fromEntries(
            Object.entries(settings).map(([key, value]) => {
                if (NUMERIC_FIELDS.includes(key)) {
                    const asNumber = parseFloat(String(value).replace(',', '.'));
                    return [key, isNaN(asNumber) ? value : asNumber];
                }
                return [key, value];
            })
        );
        console.log('Loaded and robustly normalized settings:', normalized);
        formikRef.current.setValues(normalized);
        // Log Formik values after setValues
        setTimeout(() => {
            console.log('Formik values after setValues:', formikRef.current.values);
        }, 0);
        setIsLoadModalOpen(false);
    };

    // Replace all alert() calls with showNotification()
    const validateGridSize = (values: SimulationParams) => {
        if (values.grid_size > 400) {
            showNotification('Grid size cannot exceed 400x400');
            return false;
        }
        return true;
    };

    const validateEntityCounts = (values: SimulationParams) => {
        const totalCells = values.grid_size * values.grid_size;
        if (values.initial_predators + values.initial_prey > totalCells) {
            showNotification(`Total number of predators (${values.initial_predators}) and prey (${values.initial_prey}) cannot exceed the total number of cells (${totalCells})`);
            return false;
        }
        return true;
    };

    const handleTimeoutError = (gridSize: number) => {
        showNotification(
            `The server timed out trying to create a ${gridSize}×${gridSize} grid.\n\n` +
            'Please try:\n' +
            '1. A smaller grid size\n' +
            '2. Fewer initial entities\n' +
            '3. Running the simulation locally'
        );
    };

    const handleSimulationError = (error: any) => {
        showNotification(`Error: ${error.message || 'Unknown error occurred'}`);
    };

    const handleWebSocketError = (message: string, error?: any) => {
        if (!error) {
            showNotification(`${message}: No response from server. Please check if the backend is running.`);
        } else {
            showNotification(`${message}: ${error.message}`);
        }
    };

    const handleLargeGridWarning = (gridSize: number) => {
        showNotification(
            `The server is having trouble processing this large grid (${gridSize}×${gridSize}).\n\n` +
            'Consider:\n' +
            '1. Using a smaller grid size\n' +
            '2. Reducing the number of entities\n' +
            '3. Running the simulation locally'
        );
    };

    const handleConnectionIssues = () => {
        showNotification('Auto-run stopped due to persistent connection issues. Please try manual stepping or restart the simulation.');
    };

    const handleRecordingSaved = (recordingId: string) => {
        showNotification(`Recording saved successfully with ID: ${recordingId}`);
    };

    const handleRecordingError = (error: any) => {
        if (error.response?.data?.message) {
            showNotification(`Error saving recording: ${error.response.data.message}`);
        } else {
            showNotification('Failed to save recording. See console for details.');
        }
    };

    const handleSettingsError = (message: string) => {
        showNotification(message);
    };

    // Render either setup or simulation based on status
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            <div className="container mx-auto px-4 py-8">
                {status === 'setup' ? (
                    <SimulationSetup onStartSimulation={startSimulation} />
                ) : (
                    <RunningSimulation
                        simulationId={simulationId || ''}
                        grid={grid}
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        statistics={statistics}
                        status={status}
                        chartData={chartData}
                        isGridFullscreen={isGridFullscreen}
                        isChartFullscreen={isChartFullscreen}
                        setIsGridFullscreen={setIsGridFullscreen}
                        setIsChartFullscreen={setIsChartFullscreen}
                        viewportOffset={viewportOffset}
                        setViewportOffset={setViewportOffset}
                        zoomLevel={zoomLevel}
                        setZoomLevel={setZoomLevel}
                        autoRunSimulation={autoRunSimulation}
                    />
                )}
            </div>
        </div>
    )
} 
