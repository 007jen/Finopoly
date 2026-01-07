/**
 * Paste this script into your browser's console (F12) to see a detailed 
 * performance breakdown of the current page.
 */
(function () {
    console.log("%c🚀 Finopoly Performance Audit Initialized", "color: #3b82f6; font-weight: bold; font-size: 14px;");

    // 1. Navigation Timing
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry) {
        console.table({
            "DNS Lookup": (navEntry.domainLookupEnd - navEntry.domainLookupStart).toFixed(2) + "ms",
            "TCP Connect": (navEntry.connectEnd - navEntry.connectStart).toFixed(2) + "ms",
            "TTFB (Time to First Byte)": (navEntry.responseStart - navEntry.requestStart).toFixed(2) + "ms",
            "DOM Interactive": (navEntry.domInteractive).toFixed(2) + "ms",
            "Full Page Load": (navEntry.duration).toFixed(2) + "ms"
        });
    }

    // 2. Resource Breakdown
    const resources = performance.getEntriesByType("resource");
    const slowResources = resources
        .filter(r => r.duration > 200)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);

    if (slowResources.length > 0) {
        console.log("%c⚠️ Top 5 Slowest Resources (>200ms):", "color: #f59e0b; font-weight: bold;");
        slowResources.forEach(r => {
            console.log(`${Math.round(r.duration)}ms - ${r.name.split('/').pop().split('?')[0]}`);
        });
    }

    // 3. Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            console.log("%c✨ LCP (Main Content Rendered):", "color: #10b981; font-weight: bold;", Math.round(entry.startTime) + "ms");
        }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
})();
