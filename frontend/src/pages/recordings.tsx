import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router'
import axios from 'axios'

const inter = Inter({ subsets: ['latin'] })

// Entity colors (same as in simulate.tsx)
const COLORS = {
    0: 'black',   // Empty
    1: '#f7dc6f', // Prey (yellow)
    2: '#e74c3c', // Predator (red)
    3: '#27ae60'  // Substrate (green)
}

export default function Recordings() {
    const router = useRouter()
    const [recordings, setRecordings] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [selectedRecording, setSelectedRecording] = useState<string | null>(null)
    const [recordingData, setRecordingData] = useState<any | null>(null)
    const [currentFrame, setCurrentFrame] = useState<number>(0)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
    const animationRef = useRef<number | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Fetch available recordings
    useEffect(() => {
        async function fetchRecordings() {
            try {
                setLoading(true)
                const response = await axios.get('/api/recordings')
                setRecordings(response.data.recordings || [])
            } catch (error) {
                console.error('Error fetching recordings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecordings()
    }, [])

    // Load recording when selected
    useEffect(() => {
        if (!selectedRecording) {
            setRecordingData(null)
            return
        }

        async function loadRecording() {
            try {
                setLoading(true)
                const response = await axios.get(`/api/recordings/${selectedRecording}`)

                if (response.data && response.data.status === 'success') {
                    setRecordingData(response.data)
                    setCurrentFrame(0)
                    setIsPlaying(false)
                } else {
                    console.error('Error loading recording:', response.data.message)
                    alert(`Error: ${response.data.message || 'Failed to load recording'}`)
                }
            } catch (error) {
                console.error('Error loading recording:', error)
                alert('Failed to load recording. See console for details.')
            } finally {
                setLoading(false)
            }
        }

        loadRecording()
    }, [selectedRecording])

    // Handle playback
    useEffect(() => {
        if (isPlaying && recordingData && recordingData.frames) {
            const startPlayback = () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current)
                }

                let lastTimestamp = 0
                const interval = 1000 / (5 * playbackSpeed) // 5 frames per second × speed multiplier

                const animate = (timestamp: number) => {
                    if (!lastTimestamp || timestamp - lastTimestamp >= interval) {
                        lastTimestamp = timestamp

                        // Advance frame
                        setCurrentFrame(prev => {
                            // Loop back to beginning if we reach the end
                            if (prev >= recordingData.frames.length - 1) {
                                return 0
                            }
                            return prev + 1
                        })
                    }

                    animationRef.current = requestAnimationFrame(animate)
                }

                animationRef.current = requestAnimationFrame(animate)
            }

            startPlayback()

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current)
                }
            }
        }
    }, [isPlaying, recordingData, playbackSpeed])

    // Draw current frame on canvas
    useEffect(() => {
        if (!recordingData || !recordingData.frames || !canvasRef.current) return

        const frame = recordingData.frames[currentFrame]
        if (!frame || !frame.grid) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas dimensions
        const grid = frame.grid
        const gridSize = grid.length

        canvas.width = 600
        canvas.height = 600

        // Calculate cell size
        const cellSize = Math.min(
            Math.floor(canvas.width / gridSize),
            Math.floor(canvas.height / gridSize)
        )

        // Calculate grid dimensions in pixels
        const gridWidthPx = gridSize * cellSize
        const gridHeightPx = gridSize * cellSize

        // Center the grid in the canvas
        const offsetX = Math.max(0, Math.floor((canvas.width - gridWidthPx) / 2))
        const offsetY = Math.max(0, Math.floor((canvas.height - gridHeightPx) / 2))

        // Clear canvas with background color
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw border
        ctx.strokeStyle = '#333'
        ctx.strokeRect(offsetX, offsetY, gridWidthPx, gridHeightPx)

        // Draw grid cells
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cellValue = grid[y][x]
                ctx.fillStyle = COLORS[cellValue as keyof typeof COLORS]
                ctx.fillRect(
                    offsetX + x * cellSize,
                    offsetY + y * cellSize,
                    cellSize,
                    cellSize
                )
            }
        }

        // Add frame info
        ctx.font = '14px sans-serif'
        ctx.fillStyle = 'black'
        ctx.textAlign = 'left'
        ctx.fillText(`Frame: ${currentFrame + 1}/${recordingData.frames.length}`, 10, canvas.height - 10)
    }, [recordingData, currentFrame])

    // Delete a recording
    const deleteRecording = async (recordingId: string) => {
        if (!window.confirm(`Are you sure you want to delete the recording "${recordingId}"?`)) {
            return
        }

        try {
            const response = await axios.delete(`/api/recordings/${recordingId}`)

            if (response.data && response.data.status === 'success') {
                // Remove from list and clear selection if it was selected
                setRecordings(prev => prev.filter(r => r.simulation_id !== recordingId))
                if (selectedRecording === recordingId) {
                    setSelectedRecording(null)
                    setRecordingData(null)
                }
                alert('Recording deleted successfully')
            } else {
                alert(`Error: ${response.data.message || 'Failed to delete recording'}`)
            }
        } catch (error) {
            console.error('Error deleting recording:', error)
            alert('Failed to delete recording. See console for details.')
        }
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleString()
        } catch (e) {
            return dateString
        }
    }

    return (
        <>
            <Head>
                <title>Recordings - modCA_7</title>
                <meta name="description" content="View and play back simulation recordings" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Simulation Recordings</h1>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-secondary"
                        >
                            Back to Home
                        </button>
                    </div>

                    {loading && <div className="text-center py-6">Loading...</div>}

                    {!loading && recordings.length === 0 && (
                        <div className="card p-6 text-center">
                            <p className="text-gray-600 dark:text-gray-300 mb-4">No recordings found.</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Run a simulation with recording enabled to create a recording.
                            </p>
                        </div>
                    )}

                    {!loading && recordings.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <div className="card p-4">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">Available Recordings</h2>
                                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                        {recordings.map(recording => (
                                            <div
                                                key={recording.simulation_id}
                                                className={`p-3 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedRecording === recording.simulation_id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-dark-border'
                                                    }`}
                                                onClick={() => setSelectedRecording(recording.simulation_id)}
                                            >
                                                <div className="flex justify-between">
                                                    <div className="font-medium">{recording.simulation_id}</div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            deleteRecording(recording.simulation_id)
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Delete recording"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(recording.created_at)}
                                                </div>
                                                <div className="text-sm mt-1">
                                                    Grid: {recording.grid_size}×{recording.grid_size},
                                                    Frames: {recording.frame_count}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                {!selectedRecording && (
                                    <div className="card p-6 text-center h-full flex items-center justify-center">
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                Select a recording from the list to view
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedRecording && recordingData && (
                                    <div className="card p-4">
                                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">
                                            Recording: {recordingData.metadata.simulation_id}
                                        </h2>

                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        Created: {formatDate(recordingData.metadata.created_at)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        Grid: {recordingData.metadata.grid_size}×{recordingData.metadata.grid_size}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 mb-4">
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => setIsPlaying(!isPlaying)}
                                                >
                                                    {isPlaying ? 'Pause' : 'Play'}
                                                </button>

                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                                                    disabled={isPlaying}
                                                >
                                                    &lt; Prev
                                                </button>

                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => setCurrentFrame(Math.min(recordingData.frames.length - 1, currentFrame + 1))}
                                                    disabled={isPlaying}
                                                >
                                                    Next &gt;
                                                </button>

                                                <div className="ml-4">
                                                    <label className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                                                        Speed:
                                                    </label>
                                                    <select
                                                        className="border rounded-md px-2 py-1 text-sm"
                                                        value={playbackSpeed.toString()}
                                                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                                                    >
                                                        <option value="0.5">0.5x</option>
                                                        <option value="1">1x</option>
                                                        <option value="2">2x</option>
                                                        <option value="4">4x</option>
                                                        <option value="8">8x</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <input
                                                type="range"
                                                min="0"
                                                max={recordingData.frames.length - 1}
                                                value={currentFrame}
                                                onChange={(e) => {
                                                    setIsPlaying(false)
                                                    setCurrentFrame(parseInt(e.target.value))
                                                }}
                                                className="w-full"
                                            />

                                            <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                Frame {currentFrame + 1} of {recordingData.frames.length}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap">
                                            <div className="w-full lg:w-3/4 px-2">
                                                <div className="border dark:border-dark-border rounded-md p-2">
                                                    <canvas
                                                        ref={canvasRef}
                                                        className="w-full max-h-[600px] object-contain"
                                                    ></canvas>
                                                </div>
                                            </div>

                                            <div className="w-full lg:w-1/4 px-2 mt-4 lg:mt-0">
                                                {recordingData.frames[currentFrame]?.statistics && (
                                                    <div className="space-y-2">
                                                        <h3 className="font-medium text-gray-800 dark:text-dark-text">
                                                            Frame Statistics
                                                        </h3>

                                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                                                            <div className="text-sm text-red-600 dark:text-red-400">Predators</div>
                                                            <div className="text-xl font-bold text-red-800 dark:text-red-300">
                                                                {recordingData.frames[currentFrame].statistics.predator_count}
                                                            </div>
                                                        </div>

                                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2">
                                                            <div className="text-sm text-yellow-600 dark:text-yellow-400">Prey</div>
                                                            <div className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
                                                                {recordingData.frames[currentFrame].statistics.prey_count}
                                                            </div>
                                                        </div>

                                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2">
                                                            <div className="text-sm text-green-600 dark:text-green-400">Substrate</div>
                                                            <div className="text-xl font-bold text-green-800 dark:text-green-300">
                                                                {recordingData.frames[currentFrame].statistics.substrate_count}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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