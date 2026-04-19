/**
 * trafficMonitor.js
 * This middleware passively observes requests to calculate network traffic 
 * metrics (Bytes transferred, packets, durations) required by the GNN-IDS model.
 * It uses a 10-second sliding window to automatically revert status to normal.
 */

// Internal state for the 10-second sliding window
const buckets = Array(10).fill(null).map(() => ({ req: 0, fwd: 0, bwd: 0 }));
let currentIndex = 0;

// Rotate buckets every 1 second
setInterval(() => {
    currentIndex = (currentIndex + 1) % 10;
    buckets[currentIndex] = { req: 0, fwd: 0, bwd: 0 };
}, 1000);

// Global memory store for live network metrics (using getters for the sliding window)
const globalMetrics = {
    get totalRequests() { return buckets.reduce((sum, b) => sum + b.req, 0); },
    get totalFwdBytes() { return buckets.reduce((sum, b) => sum + b.fwd, 0); },
    get totalBwdBytes() { return buckets.reduce((sum, b) => sum + b.bwd, 0); },
    flowDurations: [],
    flowBytesPerSec: 0,
    activeConnections: 0
};

const trafficMonitor = (req, res, next) => {
    const startTime = process.hrtime();
    globalMetrics.activeConnections++;
    
    // Update current bucket for the sliding window
    buckets[currentIndex].req++;

    // Estimate Forward Bytes (Incoming)
    const reqSize = parseInt(req.headers['content-length'] || 0) + Buffer.byteLength(req.url);
    buckets[currentIndex].fwd += reqSize;

    // Track Outgoing (Response)
    const originalSend = res.send;
    res.send = function (data) {
        // Intercept size before resuming normal operation instantly
        if (data) {
            const resSize = Buffer.byteLength(data.toString());
            buckets[currentIndex].bwd += resSize;
        }
        originalSend.apply(res, arguments);
    };

    // Calculate Flow Duration when finished
    res.on('finish', () => {
        const diff = process.hrtime(startTime);
        const durationMs = (diff[0] * 1e3) + (diff[1] * 1e-6); // Time in milliseconds
        
        globalMetrics.flowDurations.push(durationMs);
        if (globalMetrics.flowDurations.length > 100) globalMetrics.flowDurations.shift(); // Keep moving window
        
        globalMetrics.activeConnections--;
    });

    next(); // Pass to the actual routes (Voting/Auth/etc) safely
};

const resetMetrics = () => {
    // Clear all buckets
    buckets.forEach(b => {
        b.req = 0;
        b.fwd = 0;
        b.bwd = 0;
    });
    globalMetrics.flowDurations = [];
    globalMetrics.activeConnections = 0;
    console.log("📊 Network sliding window has been reset.");
};

module.exports = { trafficMonitor, globalMetrics, resetMetrics };
