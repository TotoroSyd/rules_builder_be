"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const responseHandlers_1 = require("../utils/responseHandlers");
const constants_1 = require("../constants/constants");
/**
 * Middleware: validates Bearer token from the Authorization header.
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        (0, responseHandlers_1.ErrorResHandler)(res, 'Missing Authorization header', 401);
        return;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        (0, responseHandlers_1.ErrorResHandler)(res, 'Malformed Authorization header. Expected: Bearer <token>', 401);
        return;
    }
    const token = parts[1];
    if (token !== constants_1.VALID_TOKEN) {
        (0, responseHandlers_1.ErrorResHandler)(res, 'Invalid or expired token', 403);
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map