"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResHandler = SuccessResHandler;
exports.ErrorResHandler = ErrorResHandler;
/**
 * Send a standardised success response.
 *
 * @param res     Express Response object
 * @param data    Payload to include under `data`
 * @param message Optional human-readable message
 * @param status  HTTP status code (default 200)
 */
function SuccessResHandler(res, data, message, status = 200) {
    const payload = {
        success: true,
        data,
        ...(message ? { message } : {}),
    };
    console.info(`Response: ${status} - ${message ?? 'No message'} - Payload:`, data);
    res.status(status).json(payload);
}
/**
 * Send a standardised error response.
 *
 * @param res     Express Response object
 * @param error   Short error message
 * @param status  HTTP status code (default 400)
 * @param details Optional array of validation / debug details
 */
function ErrorResHandler(res, error, status = 400, details) {
    const payload = {
        success: false,
        error,
        ...(details?.length ? { details } : {}),
    };
    console.error(`Error: ${status} - ${error} - Details:`, details);
    res.status(status).json(payload);
}
//# sourceMappingURL=responseHandlers.js.map