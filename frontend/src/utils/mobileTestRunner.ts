import { MOBILE_DEVICES, runMobileTests, logTestResults } from './mobileTest';

interface TestResult {
    device: string;
    viewport: { width: number; height: number };
    results: ReturnType<typeof runMobileTests>;
    timestamp: string;
}

class MobileTestRunner {
    private results: TestResult[] = [];
    private currentDevice: string = 'iPhone12Pro';

    async runTests() {
        console.group('Mobile Responsiveness Test Suite');
        console.log('Starting tests...');

        for (const [device, viewport] of Object.entries(MOBILE_DEVICES)) {
            console.group(`Testing on ${device} (${viewport.width}x${viewport.height})`);

            // Update viewport
            this.currentDevice = device;
            this.updateViewport(viewport);

            // Wait for layout to update
            await new Promise(resolve => setTimeout(resolve, 100));

            // Run tests and wait for results
            const results = await runMobileTests();
            this.results.push({
                device,
                viewport,
                results,
                timestamp: new Date().toISOString()
            });

            // Log results
            console.log(`Test results for ${device}:`);
            logTestResults(results);
            console.groupEnd();
        }

        // Generate summary
        this.generateSummary();
        console.groupEnd();
    }

    private updateViewport(viewport: { width: number; height: number }) {
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            meta.setAttribute('content',
                `width=${viewport.width}, height=${viewport.height}, initial-scale=1, maximum-scale=1, user-scalable=0`
            );
        }
    }

    private generateSummary() {
        console.group('Test Summary');

        const totalTests = this.results.reduce((sum, result) =>
            sum + result.results.summary.totalTests, 0);
        const totalPass = this.results.reduce((sum, result) =>
            sum + result.results.summary.totalPass, 0);
        const totalFail = this.results.reduce((sum, result) =>
            sum + result.results.summary.totalFail, 0);

        console.log(`Total Devices Tested: ${this.results.length}`);
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Total Pass: ${totalPass}`);
        console.log(`Total Fail: ${totalFail}`);
        console.log(`Pass Rate: ${((totalPass / totalTests) * 100).toFixed(2)}%`);

        // Device-specific issues
        console.group('Device-Specific Issues');
        this.results.forEach(result => {
            if (result.results.summary.totalFail > 0) {
                console.group(result.device);
                console.log(`Failed Tests: ${result.results.summary.totalFail}`);

                if (result.results.touch.fail > 0) {
                    console.log('Touch Issues:', result.results.touch.details);
                }
                if (result.results.text.fail > 0) {
                    console.log('Text Issues:', result.results.text.details);
                }
                if (result.results.layout.fail > 0) {
                    console.log('Layout Issues:', result.results.layout.details);
                }
                console.groupEnd();
            }
        });
        console.groupEnd();

        console.groupEnd();
    }

    getResults(): TestResult[] {
        return this.results;
    }
}

// Export singleton instance
export const mobileTestRunner = new MobileTestRunner();

// Export test function
export const runMobileTestSuite = async () => {
    await mobileTestRunner.runTests();
    return mobileTestRunner.getResults();
}; 