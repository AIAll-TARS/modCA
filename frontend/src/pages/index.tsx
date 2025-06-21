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
                <title>modCA</title>
                <meta name="description" content="Web-based cellular automata simulation for ecosystem modeling" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
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
            `}</style>

            <main className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                <div className="container mx-auto px-4 py-16 max-w-7xl">
                    <header className="mb-16 text-center">
                        <h1 className="text-5xl font-bold text-gray-800 dark:text-dark-text mb-4">modCA</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            An ecosystem simulation based on cellular automata where predators, prey, and substrate interact based on probabilistic rules.
                        </p>
                    </header>

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8 mb-16">
                            <div className="flex flex-col items-center">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Start New Simulation</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                                    Configure and run a new simulation with custom parameters.
                                </p>
                                <button
                                    onClick={() => router.push('/simulate')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-md transition-colors text-lg w-48"
                                >
                                    Start Now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 bg-white dark:bg-dark-card rounded-lg shadow-md p-8 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-semibold text-gray-800 dark:text-dark-text mb-6">About the Simulation</h2>
                        <div className="prose max-w-none text-gray-700 dark:text-gray-300">
                            <p className="mb-4">
                                modCA is a cellular automata-based ecosystem simulation where different entities interact based on probabilistic rules:
                            </p>
                            <ul className="list-disc pl-6 mb-4">
                                <li className="mb-2"><span className="font-semibold text-red-600 dark:text-red-400">Predators</span> hunt prey and reproduce when successful.</li>
                                <li className="mb-2"><span className="font-semibold text-yellow-500 dark:text-yellow-400">Prey</span> consume substrate and reproduce, while avoiding predators.</li>
                                <li className="mb-2"><span className="font-semibold text-green-600 dark:text-green-400">Substrate</span> forms randomly and serves as a food source for prey.</li>
                            </ul>
                            <p className="mb-4">
                                This web version allows you to configure, run, and analyze simulations directly in your browser. Watch the ecosystem evolve in real-time and observe complex emergent behaviors.
                            </p>
                            <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
                                Read more about modCA →
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Contact Us</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Have questions or feedback? We'd love to hear from you.
                            </p>
                            <>
                                <div className="relative inline-block group">
                                    <span className="text-gray-800 dark:text-gray-200 cursor-pointer select-none">
                                        aiall@janis7ewski.org
                                    </span>
                                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-max">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText('aiall@janis7ewski.org');
                                                const overlay = document.createElement('div');
                                                overlay.className = 'fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center transition-opacity duration-1000 z-50';
                                                const message = document.createElement('div');
                                                message.className = 'bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-xl text-gray-800 dark:text-gray-200 text-lg font-medium';
                                                message.textContent = 'Email copied to clipboard!';
                                                overlay.appendChild(message);
                                                document.body.appendChild(overlay);
                                                setTimeout(() => {
                                                    overlay.style.opacity = '0';
                                                    setTimeout(() => {
                                                        document.body.removeChild(overlay);
                                                    }, 1000);
                                                }, 1000);
                                            }}
                                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Copy Email
                                        </button>
                                    </div>
                                </div>
                            </>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
} 