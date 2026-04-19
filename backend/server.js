require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { trafficMonitor } = require("./middleware/trafficMonitor");

const app = express();

// Passively monitor traffic. Does not block or modify requests.
app.use(trafficMonitor);


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminauthRoutes"));
app.use("/api/elections", require("./routes/electionRoutes"));
app.use("/api/parties", require("./routes/partyRoutes"));
app.use("/api/candidates", require("./routes/candidateRoutes"));
app.use("/api/voter", require("./routes/voterRoutes"));

// Dedicated hidden endpoint for the Python AI script
app.use("/api/telemetry", require("./routes/telemetryRoutes"));

app.listen(5001, () => {
    console.log("Server running on http://localhost:5001");
});
