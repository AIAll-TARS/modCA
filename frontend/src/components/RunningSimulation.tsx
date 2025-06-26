import React, { useEffect, useRef } from "react";
import { Line } from 'react-chartjs-2';
import {
    COLORS,
    CHART_COLORS,
    PREDATOR,
    PREY,
    SUBSTRATE,
    LARGE_GRID_THRESHOLD
} from '../constants';
import { SimulationChartData } from '../types';

interface RunningSimulationProps {
    simulationId: string;
    grid: number[][];
    currentStep: number;
    totalSteps: number;
    statistics: any;
    status: string;
    chartData: SimulationChartData;
    isGridFullscreen: boolean;
    isChartFullscreen: boolean;
    setIsGridFullscreen: (value: boolean) => void;
    setIsChartFullscreen: (value: boolean) => void;
    viewportOffset: { x: number; y: number };
    setViewportOffset: (value: { x: number; y: number }) => void;
    zoomLevel: number;
    setZoomLevel: (value: number) => void;
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
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

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
            setZoomLevel(prev => Math.min(Math.max(prev + zoomChange, 0.5), 20));
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

            setViewportOffset(prev => ({
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
            <div className="card p-6">
                <div className="flex flex-wrap -mx-2">
                    <div className="w-full lg:w-1/2 px-2 mb-4">
                        <div className="border dark:border-dark-border rounded-md p-2">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text">Grid Visualization</h3>
                                <button
                                    className="btn-secondary text-sm px-2 py-1"
                                    onClick={() => setIsGridFullscreen(!isGridFullscreen)}
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
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text">Population Trends</h3>
                                <button
                                    className="btn-secondary text-sm px-2 py-1"
                                    onClick={() => setIsChartFullscreen(!isChartFullscreen)}
                                >
                                    Fullscreen
                                </button>
                            </div>
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
                                                },
                                                display: chartData.labels.length > 0
                                            },
                                            x: {
                                                ticks: {
                                                    color: document.documentElement.classList.contains('dark') ? '#E0E0E0' : undefined
                                                },
                                                grid: {
                                                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : undefined
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
                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-2">Current Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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
                    <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-md p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Population</div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-300">
                            {(statistics.predator_count || 0) + (statistics.prey_count || 0) + (statistics.substrate_count || 0)}
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
    );
};
