// Mobile device testing utilities

// Common mobile device viewport sizes
export const MOBILE_DEVICES = {
    iPhoneSE: { width: 375, height: 667 },
    iPhone12Pro: { width: 390, height: 844 },
    iPhone12ProMax: { width: 428, height: 926 },
    Pixel5: { width: 393, height: 851 },
    SamsungGalaxyS20: { width: 360, height: 800 },
    iPadMini: { width: 768, height: 1024 },
    iPadPro: { width: 1024, height: 1366 }
};

// Test touch interactions
export const testTouchInteractions = () => {
    const touchElements = document.querySelectorAll('button, [role="button"], a');
    const results = {
        total: touchElements.length,
        pass: 0,
        fail: 0,
        details: [] as string[]
    };

    touchElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isTouchFriendly = rect.width >= 44 && rect.height >= 44;

        if (isTouchFriendly) {
            results.pass++;
        } else {
            results.fail++;
            results.details.push(`Element ${el.tagName} is too small: ${rect.width}x${rect.height}px`);
        }
    });

    return results;
};

// Test text readability
export const testTextReadability = () => {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    const results = {
        total: textElements.length,
        pass: 0,
        fail: 0,
        details: [] as string[]
    };

    textElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const fontSize = parseInt(style.fontSize);
        const lineHeight = parseInt(style.lineHeight);

        const isReadable = fontSize >= 14 && lineHeight >= 1.2;

        if (isReadable) {
            results.pass++;
        } else {
            results.fail++;
            results.details.push(`Text element ${el.tagName} has small font: ${fontSize}px`);
        }
    });

    return results;
};

// Test layout responsiveness
export const testLayoutResponsiveness = () => {
    const containerElements = document.querySelectorAll('.container-mobile, .card, .grid-mobile');
    const results = {
        total: containerElements.length,
        pass: 0,
        fail: 0,
        details: [] as string[]
    };

    containerElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Check if container has proper padding on mobile
        const hasProperPadding = rect.left >= 16 && rect.right <= viewportWidth - 16;

        if (hasProperPadding) {
            results.pass++;
        } else {
            results.fail++;
            results.details.push(`Container ${el.className} has improper padding`);
        }
    });

    return results;
};

// Run all tests
export const runMobileTests = () => {
    const touchResults = testTouchInteractions();
    const textResults = testTextReadability();
    const layoutResults = testLayoutResponsiveness();

    return {
        touch: touchResults,
        text: textResults,
        layout: layoutResults,
        summary: {
            totalTests: touchResults.total + textResults.total + layoutResults.total,
            totalPass: touchResults.pass + textResults.pass + layoutResults.pass,
            totalFail: touchResults.fail + textResults.fail + layoutResults.fail
        }
    };
};

// Log test results
export const logTestResults = (results: ReturnType<typeof runMobileTests>) => {
    console.group('Mobile Responsiveness Test Results');

    console.group('Touch Interactions');
    console.log(`Pass: ${results.touch.pass}, Fail: ${results.touch.fail}`);
    if (results.touch.fail > 0) {
        console.log('Failed elements:', results.touch.details);
    }
    console.groupEnd();

    console.group('Text Readability');
    console.log(`Pass: ${results.text.pass}, Fail: ${results.text.fail}`);
    if (results.text.fail > 0) {
        console.log('Failed elements:', results.text.details);
    }
    console.groupEnd();

    console.group('Layout Responsiveness');
    console.log(`Pass: ${results.layout.pass}, Fail: ${results.layout.fail}`);
    if (results.layout.fail > 0) {
        console.log('Failed elements:', results.layout.details);
    }
    console.groupEnd();

    console.group('Summary');
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Total Pass: ${results.summary.totalPass}`);
    console.log(`Total Fail: ${results.summary.totalFail}`);
    console.groupEnd();

    console.groupEnd();
}; 