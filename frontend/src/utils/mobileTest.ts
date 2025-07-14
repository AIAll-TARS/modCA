export const MOBILE_DEVICES = {
    iPhone12Pro: { width: 390, height: 844 },
    iPhoneSE: { width: 375, height: 667 },
    iPhoneXR: { width: 414, height: 896 },
    iPhone12ProMax: { width: 428, height: 926 },
    Pixel5: { width: 393, height: 851 },
    SamsungGalaxyS20: { width: 360, height: 800 },
    SamsungGalaxyS24: { width: 393, height: 852 },
    iPadPro: { width: 1024, height: 1366 },
    iPadAir: { width: 820, height: 1180 },
    iPadMini: { width: 768, height: 1024 },
} as const;

interface TestResult {
    pass: number;
    fail: number;
    details: string[];
}

export interface TestResults {
    touch: TestResult;
    text: TestResult;
    layout: TestResult;
    summary: {
        totalTests: number;
        totalPass: number;
        totalFail: number;
    };
}

export async function runMobileTests(): Promise<TestResults> {
    const results: TestResults = {
        touch: { pass: 0, fail: 0, details: [] },
        text: { pass: 0, fail: 0, details: [] },
        layout: { pass: 0, fail: 0, details: [] },
        summary: { totalTests: 0, totalPass: 0, totalFail: 0 }
    };

    // Test touch interactions
    try {
        // Test button touch targets
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                results.touch.fail++;
                results.touch.details.push(`Button "${button.textContent}" touch target too small: ${rect.width}x${rect.height}px`);
            } else {
                results.touch.pass++;
            }
        });

        // Test input touch targets
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const rect = input.getBoundingClientRect();
            if (rect.height < 44) {
                results.touch.fail++;
                results.touch.details.push(`Input "${input.getAttribute('name') || 'unnamed'}" touch target too small: ${rect.height}px height`);
            } else {
                results.touch.pass++;
            }
        });
    } catch (error) {
        results.touch.fail++;
        results.touch.details.push(`Error testing touch interactions: ${error}`);
    }

    // Test text readability
    try {
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const fontSize = parseFloat(style.fontSize);
            const lineHeight = parseFloat(style.lineHeight);

            if (fontSize < 16) {
                results.text.fail++;
                results.text.details.push(`Text too small (${fontSize}px) in element: ${element.textContent?.substring(0, 30)}...`);
            } else {
                results.text.pass++;
            }

            if (lineHeight < fontSize * 1.2) {
                results.text.fail++;
                results.text.details.push(`Line height too small (${lineHeight}px) for font size ${fontSize}px`);
            } else {
                results.text.pass++;
            }
        });
    } catch (error) {
        results.text.fail++;
        results.text.details.push(`Error testing text readability: ${error}`);
    }

    // Test layout responsiveness
    try {
        // Test container width
        const containers = document.querySelectorAll('.container, .container-mobile');
        containers.forEach(container => {
            const rect = container.getBoundingClientRect();
            if (rect.width > window.innerWidth) {
                results.layout.fail++;
                results.layout.details.push(`Container width (${rect.width}px) exceeds viewport width (${window.innerWidth}px)`);
            } else {
                results.layout.pass++;
            }
        });

        // Test horizontal scrolling
        if (document.documentElement.scrollWidth > window.innerWidth) {
            results.layout.fail++;
            results.layout.details.push('Horizontal scrolling detected');
        } else {
            results.layout.pass++;
        }

        // Test media queries
        const mediaQueries = [
            window.matchMedia('(max-width: 640px)'),
            window.matchMedia('(max-width: 768px)'),
            window.matchMedia('(max-width: 1024px)')
        ];

        mediaQueries.forEach(mq => {
            if (mq.matches) {
                results.layout.pass++;
            } else {
                results.layout.fail++;
                results.layout.details.push(`Media query ${mq.media} not matching`);
            }
        });
    } catch (error) {
        results.layout.fail++;
        results.layout.details.push(`Error testing layout responsiveness: ${error}`);
    }

    // Calculate summary
    results.summary.totalTests =
        results.touch.pass + results.touch.fail +
        results.text.pass + results.text.fail +
        results.layout.pass + results.layout.fail;

    results.summary.totalPass =
        results.touch.pass + results.text.pass + results.layout.pass;

    results.summary.totalFail =
        results.touch.fail + results.text.fail + results.layout.fail;

    return results;
}

export function logTestResults(results: TestResults): void {
    console.group('Mobile Responsiveness Test Results');

    console.group('Touch Interactions');
    console.log(`Pass: ${results.touch.pass}, Fail: ${results.touch.fail}`);
    if (results.touch.fail > 0) {
        console.log('Details:', results.touch.details);
    }
    console.groupEnd();

    console.group('Text Readability');
    console.log(`Pass: ${results.text.pass}, Fail: ${results.text.fail}`);
    if (results.text.fail > 0) {
        console.log('Details:', results.text.details);
    }
    console.groupEnd();

    console.group('Layout Responsiveness');
    console.log(`Pass: ${results.layout.pass}, Fail: ${results.layout.fail}`);
    if (results.layout.fail > 0) {
        console.log('Details:', results.layout.details);
    }
    console.groupEnd();

    console.group('Summary');
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Total Pass: ${results.summary.totalPass}`);
    console.log(`Total Fail: ${results.summary.totalFail}`);
    console.groupEnd();

    console.groupEnd();
} 