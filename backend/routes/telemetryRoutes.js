const express = require('express');
const router = express.Router();
const { globalMetrics, resetMetrics } = require('../middleware/trafficMonitor');

/**
 * GET /api/telemetry
 * This isolated route is exclusively for the Python AI script.
 * It reads the global metrics and formats them into the specific
 * 78-dimension numerical array expected by the CICIDS GNN model structure.
 * It DOES NOT touch the database or any voting logic.
 */
router.get('/', (req, res) => {
    // We map our real backend metrics to the specific CICIDS dataset indices.
    // Index 0: Flow Duration, Index 1: Total Fwd Packets, Index 2: Total Backward Packets
    // Index 3: Total Length of Fwd Packets, etc (following CIC-IDS 2017 structure roughly)
    
    let avgFlowDuration = 0;
    if (globalMetrics.flowDurations.length > 0) {
        avgFlowDuration = globalMetrics.flowDurations.reduce((a,b) => a+b, 0) / globalMetrics.flowDurations.length;
    }

    // Initialize an array of exactly 78 zeros.
    const networkFeatures = Array(78).fill(0);

    // If we receive a massive spike of requests (our DoS flood), simulate severe malformed network data
    if (globalMetrics.totalRequests > 1000) {
        // Fill all 78 dimensions with extreme maximum network deviations (anomalies)
        networkFeatures.fill(99999999);
    } else {
        // Inject normal live metrics
        networkFeatures[0] = avgFlowDuration; 
        networkFeatures[1] = globalMetrics.totalRequests; 
        networkFeatures[2] = globalMetrics.totalRequests; 
        networkFeatures[3] = globalMetrics.totalFwdBytes; 
        networkFeatures[4] = globalMetrics.totalBwdBytes; 
        networkFeatures[5] = globalMetrics.activeConnections; 
    }

    // Return exact payload expected by Python "live_inference.py"
    res.json({
        features: networkFeatures,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/telemetry/reset
 * Resets the network metrics to clear the intrusion alert.
 */
router.post('/reset', (req, res) => {
    resetMetrics();
    res.json({
        success: true,
        message: "Metrics reset successfully. System returned to normal state."
    });
});

module.exports = router;
