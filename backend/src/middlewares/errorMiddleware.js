import { ApiError } from "../utils/ApiError.js";


const errorMiddleware = (err, req, res, next) => {
    let { statusCode, message } = err;

    
    if (!(err instanceof ApiError)) {
        statusCode = err.statusCode || 500;
        message = err.message || "Internal Server Error";
    }

    const response = {
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };

    // Log error for the developer in terminal
    console.error(`[ERROR] ${statusCode} - ${message}`);

    return res.status(statusCode).json(response);
};

export { errorMiddleware };