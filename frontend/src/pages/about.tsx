import { fontFamily } from '@/styles/fonts'
import Head from 'next/head'
import Link from 'next/link'

export default function About() {
    return (
        <>
            <Head>
                <title>About modCA - Ecosystem Simulation</title>
                <meta name="description" content="Learn about modCA - a web-based cellular automata simulation for ecosystem modeling" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <main className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <header className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-dark-text mb-4">About modCA</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            A Web-Based Ecosystem Simulation Platform
                        </p>
                    </header>

                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">What is modCA?</h2>
                        <div className="prose max-w-none dark:prose-invert">
                            <p>
                                modCA is an advanced web-based simulation platform that models ecosystem dynamics using cellular automata.
                                Our simulation focuses on the intricate interactions between predators, prey, and environmental resources (substrate),
                                allowing you to explore and understand complex ecological systems in real-time.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Key Features</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Interactive Visualization</h3>
                                <p className="text-gray-600 dark:text-gray-300">Watch your ecosystem evolve in real-time with our intuitive grid visualization.</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Customizable Parameters</h3>
                                <p className="text-gray-600 dark:text-gray-300">Adjust population sizes, behavior probabilities, and environmental factors.</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Real-time Statistics</h3>
                                <p className="text-gray-600 dark:text-gray-300">Track population trends and ecosystem metrics as they change.</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Save & Load</h3>
                                <p className="text-gray-600 dark:text-gray-300">Save your simulation configurations and results for later analysis.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">How It Works</h2>
                        <div className="prose max-w-none dark:prose-invert">
                            <h3>Three Main Components</h3>
                            <ul>
                                <li>
                                    <span className="font-semibold text-red-600 dark:text-red-400">Predators</span>
                                    <ul>
                                        <li>Hunt and consume prey</li>
                                        <li>Move around the grid</li>
                                        <li>Reproduce when successful</li>
                                        <li>Die from natural causes</li>
                                    </ul>
                                </li>
                                <li>
                                    <span className="font-semibold text-yellow-500 dark:text-yellow-400">Prey</span>
                                    <ul>
                                        <li>Consume substrate for survival</li>
                                        <li>Avoid predators</li>
                                        <li>Reproduce when conditions are favorable</li>
                                        <li>Move to find resources</li>
                                    </ul>
                                </li>
                                <li>
                                    <span className="font-semibold text-green-600 dark:text-green-400">Substrate</span>
                                    <ul>
                                        <li>Forms naturally in the environment</li>
                                        <li>Serves as food source for prey</li>
                                        <li>Regenerates over time</li>
                                        <li>Influences ecosystem balance</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Scientific Foundation</h2>
                        <div className="prose max-w-none dark:prose-invert">
                            <p>
                                Our implementation is inspired by research in cellular automata and ecological modeling.
                                Unlike traditional cellular automata simulations, modCA uses probabilistic rules to create
                                more realistic ecosystem behaviors. This approach allows for:
                            </p>
                            <ul>
                                <li>More natural population dynamics</li>
                                <li>Complex emergent behaviors</li>
                                <li>Realistic ecological interactions</li>
                                <li>Dynamic environmental responses</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Support the Project</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            If you find modCA helpful for your research or education, consider supporting its development. Your support helps maintain and improve the platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <Link
                                href="/simulate"
                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                            >
                                Start Simulation
                            </Link>
                            <a
                                href="https://www.buymeacoffee.com/aiall"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transform hover:scale-105 transition-transform"
                            >
                                <img
                                    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                                    alt="Buy Me A Coffee"
                                    height="48"
                                    className="h-12"
                                />
                            </a>
                            <Link
                                href="/"
                                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
} 