import React, { useEffect, useRef, SetStateAction } from "react";
import { Line } from 'react-chartjs-2';
import {
    COLORS,
    CHART_COLORS,
    PREDATOR,
    PREY,
    SUBSTRATE,
    LARGE_GRID_THRESHOLD
} from '../constants';
import { ChartData } from '../types';
import { useRouter } from 'next/router';

// Define simulation status type
type SimulationStatus = 'setup' | 'loading' | 'ready' | 'running' | 'completed' | 'error' | 'saving' | 'stopped' | 'retrying-1' | 'retrying-2' | 'retrying-3';

interface RunningSimulationProps {
    simulationId: string;
    grid: number[][];
    currentStep: number;
    totalSteps: number;
    statistics: any;
    status: SimulationStatus;
    chartData: ChartData;
    isGridFullscreen: boolean;
    isChartFullscreen: boolean;
    setIsGridFullscreen: (value: SetStateAction<boolean>) => void;
    setIsChartFullscreen: (value: SetStateAction<boolean>) => void;
    viewportOffset: { x: number; y: number };
    setViewportOffset: (value: SetStateAction<{ x: number; y: number }>) => void;
    zoomLevel: number;
    setZoomLevel: (value: SetStateAction<number>) => void;
    autoRunSimulation: () => void;
}

export const RunningSimulation: React.FC<RunningSimulationProps> = ({
    simulationId,
    grid,
    currentStep,
    totalSteps,
    statistics,
    status,
    chartData,
    isGridFullscreen,
    isChartFullscreen,
    setIsGridFullscreen,
    setIsChartFullscreen,
    viewportOffset,
    setViewportOffset,
    zoomLevel,
    setZoomLevel,
    autoRunSimulation,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
    const router = useRouter();

    // Function to handle simulation start
    const handleSimulationStart = () => {
        if (status === 'running') return;
        autoRunSimulation();
    };

    // Draw grid effect
    useEffect(() => {
        if (!grid.length || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Adjust canvas dimensions when in fullscreen mode
        if (isGridFullscreen) {
            const containerWidth = window.innerWidth * 0.98;
            const containerHeight = window.innerHeight * 0.95;
            canvas.width = containerWidth;
            canvas.height = containerHeight;
        } else {
            canvas.width = 400;
            canvas.height = 400;
        }

        // Clear canvas with background color
        ctx.fillStyle = isGridFullscreen ? '#1f2937' : '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const isLargeGrid = grid.length > LARGE_GRID_THRESHOLD;
        let cellSize = 1;
        let offsetX = 0;
        let offsetY = 0;

        if (isLargeGrid && isGridFullscreen) {
            const baseCellSize = Math.min(
                canvas.width / grid.length,
                canvas.height / grid.length
            );
            cellSize = Math.min(Math.max(baseCellSize * zoomLevel, 1), 50);

            const visibleCellsX = Math.ceil(canvas.width / cellSize);
            const visibleCellsY = Math.ceil(canvas.height / cellSize);

            offsetX = Math.max(0, Math.min(grid.length - visibleCellsX, viewportOffset.x));
            offsetY = Math.max(0, Math.min(grid.length - visibleCellsY, viewportOffset.y));

            const endX = Math.min(offsetX + visibleCellsX, grid.length);
            const endY = Math.min(offsetY + visibleCellsY, grid.length);

            // Draw grid cells
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

            // Draw grid lines
            if (cellSize > 2) {
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 0.5;

                for (let x = 0; x <= endX - offsetX; x++) {
                    ctx.beginPath();
                    ctx.moveTo(x * cellSize, 0);
                    ctx.lineTo(x * cellSize, (endY - offsetY) * cellSize);
                    ctx.stroke();
                }

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
            ctx.fillText(
                `Grid: ${grid.length}×${grid.length} | Viewport: (${offsetX},${offsetY}) | Cell size: ${cellSize.toFixed(1)}px | Zoom: ${zoomLevel.toFixed(1)}x`,
                10,
                canvas.height - 10
            );
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText('Navigation: Mouse drag to pan, Scroll wheel to zoom', 10, canvas.height - 30);
        } else {
            cellSize = Math.min(
                Math.floor(canvas.width / grid.length),
                Math.floor(canvas.height / grid.length)
            );

            const gridWidthPx = grid.length * cellSize;
            const gridHeightPx = grid[0].length * cellSize;

            offsetX = Math.max(0, Math.floor((canvas.width - gridWidthPx) / 2));
            offsetY = Math.max(0, Math.floor((canvas.height - gridHeightPx) / 2));

            ctx.strokeStyle = isGridFullscreen ? '#444' : '#333';
            ctx.strokeRect(offsetX, offsetY, gridWidthPx, gridHeightPx);

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

            if (cellSize < 2 && !isGridFullscreen) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, 0, canvas.width, 30);
                ctx.font = '12px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText('Grid cells are very small. Click "Fullscreen" for better view', canvas.width / 2, 20);
            }

            if (isGridFullscreen) {
                ctx.font = '14px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'left';
                ctx.fillText(
                    `Grid: ${grid.length}×${grid.length} | Cell size: ${cellSize}px | Step: ${currentStep}/${totalSteps}`,
                    10,
                    canvas.height - 10
                );
            }
        }
    }, [grid, isGridFullscreen, currentStep, totalSteps, zoomLevel, viewportOffset]);

    // Mouse event handlers
    useEffect(() => {
        if (!isGridFullscreen || !canvasRef.current) return;

        const canvas = canvasRef.current;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const zoomChange = e.deltaY < 0 ? 0.2 : -0.2;
            setZoomLevel((prev: number) => Math.min(Math.max(prev + zoomChange, 0.5), 20));
        };

        const handleMouseDown = (e: MouseEvent) => {
            setIsDragging(true);
            setDragStart({
                x: e.clientX,
                y: e.clientY
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            const dragScale = 1 / zoomLevel;

            setViewportOffset((prev: { x: number; y: number }) => ({
                x: Math.max(0, prev.x - dx * dragScale),
                y: Math.max(0, prev.y - dy * dragScale)
            }));

            setDragStart({
                x: e.clientX,
                y: e.clientY
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
        };
    }, [isGridFullscreen, isDragging, dragStart, zoomLevel, setViewportOffset, setZoomLevel]);

    return (
        <div className="space-y-6">
            {/* Navigation buttons */}
            <div className="flex justify-end mb-4 space-x-2">
                <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    onClick={() => router.push("/")}
                >
                    Home
                </button>
                <button
                    type="button"
                    className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70"
                    onClick={handleSimulationStart}
                    disabled={status === 'running' || status === 'completed' || status === 'loading'}
                >
                    {status === 'running' ? 'Running...' : status === 'loading' ? 'Loading...' : 'Run Simulation'}
                </button>
            </div>

            {/* Loading overlay */}
            {status === 'loading' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-xl">
                        <div className="flex items-center space-x-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            <div className="text-lg text-gray-300">Loading simulation...</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error state */}
            {status === 'error' && (
                <div className="bg-red-900 border border-red-700 rounded-md p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-300">Simulation Error</h3>
                            <div className="mt-2 text-sm text-red-200">
                                <p>An error occurred while running the simulation. Please try again or check the console for details.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Retry state */}
            {(status === 'retrying-1' || status === 'retrying-2' || status === 'retrying-3') && (
                <div className="bg-yellow-900 border border-yellow-700 rounded-md p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-300">Retrying Connection</h3>
                            <div className="mt-2 text-sm text-yellow-200">
                                <p>Attempting to reconnect to the simulation server... (Attempt {status === 'retrying-1' ? '1' : status === 'retrying-2' ? '2' : '3'} of 3)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className={`card p-6 bg-gray-900 ${status === 'loading' ? 'opacity-50' : ''}`}>
                <div className="flex flex-wrap -mx-2">
                    <div className="w-full lg:w-1/2 px-2 mb-4">
                        <div className="border border-gray-700 rounded-md p-2 bg-gray-900">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-300">Grid Visualization</h3>
                                <button
                                    className="btn-secondary text-sm px-2 py-1"
                                    onClick={() => setIsGridFullscreen(!isGridFullscreen)}
                                >
                                    Fullscreen
                                </button>
                            </div>
                            <div className="aspect-square bg-gray-900 border rounded-md overflow-hidden">
                                <canvas
                                    ref={canvasRef}
                                    width={400}
                                    height={400}
                                    className="w-full h-full bg-gray-900"
                                ></canvas>
                            </div>
                            {grid.length > 100 && (
                                <div className="mt-2 text-xs text-gray-400">
                                    Large grid ({grid.length}x{grid.length}). Use fullscreen for better visibility.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 px-2 mb-4">
                        <div className="border border-gray-700 rounded-md p-2 bg-gray-900">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-300">Population Trends</h3>
                                <button
                                    className="btn-secondary text-sm px-2 py-1"
                                    onClick={() => setIsChartFullscreen(!isChartFullscreen)}
                                >
                                    Fullscreen
                                </button>
                            </div>
                            <div className="aspect-square bg-gray-900">
                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                labels: {
                                                    color: '#E0E0E0'
                                                }
                                            },
                                            title: {
                                                display: true,
                                                text: 'Population Over Time',
                                                color: '#E0E0E0'
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    color: '#E0E0E0'
                                                },
                                                grid: {
                                                    color: 'rgba(255, 255, 255, 0.1)'
                                                },
                                                display: chartData.labels.length > 0
                                            },
                                            x: {
                                                ticks: {
                                                    color: '#E0E0E0'
                                                },
                                                grid: {
                                                    color: 'rgba(255, 255, 255, 0.1)'
                                                },
                                                display: chartData.labels.length > 0
                                            }
                                        },
                                        elements: {
                                            line: {
                                                tension: 0.1
                                            },
                                            point: {
                                                radius: 0
                                            }
                                        },
                                        animation: {
                                            duration: 0
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Current Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-md p-3">
                            <div className="text-red-400 text-sm font-medium">Predators</div>
                            <div className="text-red-300 text-2xl font-bold">{statistics.predator_count || 0}</div>
                        </div>
                        <div className="bg-gray-900 border border-gray-700 rounded-md p-3">
                            <div className="text-yellow-400 text-sm font-medium">Prey</div>
                            <div className="text-yellow-300 text-2xl font-bold">{statistics.prey_count || 0}</div>
                        </div>
                        <div className="bg-gray-900 border border-gray-700 rounded-md p-3">
                            <div className="text-green-400 text-sm font-medium">Substrate</div>
                            <div className="text-green-300 text-2xl font-bold">{statistics.substrate_count || 0}</div>
                        </div>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded-md p-3">
                        <div className="text-gray-400 text-sm font-medium">Total Population</div>
                        <div className="text-gray-300 text-2xl font-bold">
                            {(statistics.predator_count || 0) + (statistics.prey_count || 0) + (statistics.substrate_count || 0)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
