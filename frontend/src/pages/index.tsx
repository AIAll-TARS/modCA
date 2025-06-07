import { fontFamily } from '@/styles/fonts'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getApiUrl } from '../utils/env'

const styles = {
    main: {
        fontFamily,
    }
}

export default function Home() {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>modCA_7</title>
                <meta name="description" content="Web-based cellular automata simulation for ecosystem modeling" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                <div className="container-mobile mx-auto py-8 sm:py-12 md:py-16">
                    <header className="mb-8 sm:mb-12 md:mb-16 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-dark-text mb-3 sm:mb-4">modCA_7</h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
                            An ecosystem simulation based on cellular automata where predators, prey, and substrate interact based on probabilistic rules.
                        </p>
                    </header>

                    <div className="grid-mobile grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                        <div className="card flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-dark-text mb-3 sm:mb-4">Start New Simulation</h2>
                                <p className="text-mobile text-gray-600 dark:text-gray-300 mb-4">
                                    Configure and run a new simulation with custom parameters.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/simulate')}
                                className="btn-success w-full sm:w-auto"
                            >
                                Start Now
                            </button>
                        </div>

                        <div className="card flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-dark-text mb-3 sm:mb-4">Load Saved Simulation</h2>
                                <p className="text-mobile text-gray-600 dark:text-gray-300 mb-4">
                                    View or continue your previously saved simulations.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/saved')}
                                className="btn-secondary w-full sm:w-auto"
                            >
                                View Saved
                            </button>
                        </div>

                        <div className="card flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-dark-text mb-3 sm:mb-4">View Recordings</h2>
                                <p className="text-mobile text-gray-600 dark:text-gray-300 mb-4">
                                    Watch recorded simulations with smooth playback at different speeds.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/recordings')}
                                className="btn-secondary w-full sm:w-auto"
                            >
                                View Recordings
                            </button>
                        </div>

                        <div className="card flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-dark-text mb-3 sm:mb-4">Documentation</h2>
                                <p className="text-mobile text-gray-600 dark:text-gray-300 mb-4">
                                    Learn more about how the simulation works and how to use it.
                                </p>
                            </div>
                            <button
                                onClick={() => window.open(getApiUrl().replace(/\/api$/, '/docs'), '_blank')}
                                className="btn-secondary w-full sm:w-auto"
                            >
                                View Docs
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 sm:mt-12 md:mt-16 card max-w-4xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-dark-text mb-4 sm:mb-6">About the Simulation</h2>
                        <div className="prose max-w-none text-mobile text-gray-700 dark:text-gray-300">
                            <p className="mb-4">
                                modCA_7 is a cellular automata-based ecosystem simulation where different entities interact based on probabilistic rules:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><span className="font-semibold text-red-600 dark:text-red-400">Predators</span> hunt prey and reproduce when successful.</li>
                                <li><span className="font-semibold text-yellow-500 dark:text-yellow-400">Prey</span> consume substrate and reproduce, while avoiding predators.</li>
                                <li><span className="font-semibold text-green-600 dark:text-green-400">Substrate</span> forms randomly and serves as a food source for prey.</li>
                            </ul>
                            <p>
                                This web version allows you to configure, run, and analyze simulations directly in your browser. Watch the ecosystem evolve in real-time and observe complex emergent behaviors.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link href="/simulate" className="btn-primary">
                            Start Simulation
                        </Link>
                        <Link href="/mobile-test" className="btn-secondary">
                            Test Mobile Responsiveness
                        </Link>
                    </div>
                </div>

                <footer className="bg-gray-800 text-white py-6 sm:py-8 mt-8 sm:mt-12 md:mt-16">
                    <div className="container-mobile mx-auto text-center">
                        <p className="text-mobile">© {new Date().getFullYear()} modCA_7 - Cellular Automata Ecosystem Simulation</p>
                    </div>
                </footer>
            </main>
        </>
    )
} 