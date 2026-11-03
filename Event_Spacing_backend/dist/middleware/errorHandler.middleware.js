"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Resource not found at ${req.method} ${req.originalUrl}`,
    });
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors;
    // Handle Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource identifier format";
    }
    // Handle Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        statusCode = 409;
        const duplicateFields = Object.keys(err.keyValue || {}).join(", ");
        message = `Duplicate field value entered for: ${duplicateFields}`;
    }
    // Handle Mongoose ValidationError
    if (err.name === "ValidationError") {
        statusCode = 400;
        const validationErrors = Object.values(err.errors).map((e) => e.message);
        message = "Validation Error";
        errors = validationErrors;
    }
    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authentication token";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Authentication token has expired. Please log in again.";
    }
    console.error(`[Error] ${statusCode} - ${message}:`, err);
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
