import { Inter } from 'next/font/google'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>modCA_7</title>
                <meta name="description" content="Web-based cellular automata simulation for ecosystem modeling" />
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
            `}</style>

            <main className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                <div className="container mx-auto px-4 py-16 max-w-7xl">
                    <header className="mb-16 text-center">
                        <h1 className="text-5xl font-bold text-gray-800 dark:text-dark-text mb-4">modCA_7</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            An ecosystem simulation based on cellular automata where predators, prey, and substrate interact based on probabilistic rules.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="card p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Start New Simulation</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Configure and run a new simulation with custom parameters.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/simulate')}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Start Now
                            </button>
                        </div>

                        <div className="card p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Load Saved Simulation</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    View or continue your previously saved simulations.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/saved')}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                View Saved
                            </button>
                        </div>

                        <div className="card p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">View Recordings</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Watch recorded simulations with smooth playback at different speeds.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/recordings')}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                View Recordings
                            </button>
                        </div>

                        <div className="card p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Documentation</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Learn more about how the simulation works and how to use it.
                                </p>
                            </div>
                            <button
                                onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                View Docs
                            </button>
                        </div>
                    </div>

                    <div className="mt-16 bg-white dark:bg-dark-card rounded-lg shadow-md p-8 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-semibold text-gray-800 dark:text-dark-text mb-6">About the Simulation</h2>
                        <div className="prose max-w-none text-gray-700 dark:text-gray-300">
                            <p className="mb-4">
                                modCA_7 is a cellular automata-based ecosystem simulation where different entities interact based on probabilistic rules:
                            </p>
                            <ul className="list-disc pl-6 mb-4">
                                <li className="mb-2"><span className="font-semibold text-red-600 dark:text-red-400">Predators</span> hunt prey and reproduce when successful.</li>
                                <li className="mb-2"><span className="font-semibold text-yellow-500 dark:text-yellow-400">Prey</span> consume substrate and reproduce, while avoiding predators.</li>
                                <li className="mb-2"><span className="font-semibold text-green-600 dark:text-green-400">Substrate</span> forms randomly and serves as a food source for prey.</li>
                            </ul>
                            <p>
                                This web version allows you to configure, run, and analyze simulations directly in your browser. Watch the ecosystem evolve in real-time and observe complex emergent behaviors.
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="bg-gray-800 text-white py-8 mt-16">
                    <div className="container mx-auto px-4 text-center">
                        <p>© {new Date().getFullYear()} modCA_7 - Cellular Automata Ecosystem Simulation</p>
                    </div>
                </footer>
            </main>
        </>
    )
} 