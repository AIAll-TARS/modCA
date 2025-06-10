import { useEffect, useState } from 'react';
import Head from 'next/head';
import { MOBILE_DEVICES } from '../utils/mobileTest';
import { runMobileTestSuite } from '../utils/mobileTestRunner';

interface TestResult {
    device: string;
    viewport: { width: number; height: number };
    results: any;
    timestamp: string;
}

export default function MobileTest() {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<string>('iPhone12Pro');

    const runTests = async () => {
        setIsRunning(true);
        try {
            const results = await runMobileTestSuite();
            setTestResults(results);
        } catch (error) {
            console.error('Error running tests:', error);
        } finally {
            setIsRunning(false);
        }
    };

    const handleDeviceChange = (device: string) => {
        setSelectedDevice(device);
        const deviceSize = MOBILE_DEVICES[device as keyof typeof MOBILE_DEVICES];

        // Update viewport size
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content',
                `width=${deviceSize.width}, height=${deviceSize.height}, initial-scale=1, maximum-scale=1, user-scalable=0`
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head>
                <title>Mobile Responsiveness Test</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            <main className="container-mobile py-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Mobile Responsiveness Test
                </h1>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Device
                    </label>
                    <select
                        value={selectedDevice}
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        {Object.keys(MOBILE_DEVICES).map((device) => (
                            <option key={device} value={device}>
                                {device} ({MOBILE_DEVICES[device as keyof typeof MOBILE_DEVICES].width}x{MOBILE_DEVICES[device as keyof typeof MOBILE_DEVICES].height})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-8">
                    <button
                        onClick={runTests}
                        disabled={isRunning}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isRunning ? 'Running Tests...' : 'Run All Tests'}
                    </button>
                </div>

                {testResults.length > 0 && (
                    <div className="space-y-6">
                        {testResults.map((result) => (
                            <div key={result.device} className="card p-4">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                    {result.device} ({result.viewport.width}x{result.viewport.height})
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                            Touch Interactions
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Pass: {result.results.touch.pass}, Fail: {result.results.touch.fail}
                                        </p>
                                        {result.results.touch.fail > 0 && (
                                            <ul className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {result.results.touch.details.map((detail: string, index: number) => (
                                                    <li key={index}>{detail}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                            Text Readability
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Pass: {result.results.text.pass}, Fail: {result.results.text.fail}
                                        </p>
                                        {result.results.text.fail > 0 && (
                                            <ul className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {result.results.text.details.map((detail: string, index: number) => (
                                                    <li key={index}>{detail}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                            Layout Responsiveness
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Pass: {result.results.layout.pass}, Fail: {result.results.layout.fail}
                                        </p>
                                        {result.results.layout.fail > 0 && (
                                            <ul className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {result.results.layout.details.map((detail: string, index: number) => (
                                                    <li key={index}>{detail}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                            Summary
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Total Tests: {result.results.summary.totalTests}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Total Pass: {result.results.summary.totalPass}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Total Fail: {result.results.summary.totalFail}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
} 