import ApplicationResponse from "../utils/ApplicationResponse.mjs";
import logger from "../utils/logger.mjs";

const errorHandler = (err, req, res, next) => {
    logger.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = null;

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";
        errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
    }

    // Duplicate Key
    if (err.code === 11000) {
        statusCode = 409;
        message = "Resource already exists";
        errors = Object.keys(err.keyValue).map((key) => ({
            field: key,
            message: `${key} already exists`,
        }));
    }

    // Invalid ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}`;
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    if (process.env.NODE_ENV !== "production") {
        errors ??= {};
        errors.stack = err.stack;
    }

    return res
        .status(statusCode)
        .json(ApplicationResponse.error(message, errors));
};

export default errorHandler;