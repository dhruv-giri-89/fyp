const jwt = require("jsonwebtoken");

// ADMIN AUTHENTICATION MIDDLEWARE
exports.authenticateAdmin = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is an admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }

        // Add admin info to request
        req.admin = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };

        next();

    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token." });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired." });
        } else {
            console.error(err);
            return res.status(500).json({ message: "Error authenticating admin." });
        }
    }
};

// OPTIONAL ADMIN AUTH (for routes that can work with or without admin auth)
exports.optionalAdminAuth = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(); // Continue without admin auth
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role === 'admin') {
            req.admin = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role
            };
        }

        next();

    } catch (err) {
        // If token is invalid/expired, continue without admin auth
        next();
    }
};