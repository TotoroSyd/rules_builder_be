import { Response } from 'express';
/**
 * Send a standardised success response.
 *
 * @param res     Express Response object
 * @param data    Payload to include under `data`
 * @param message Optional human-readable message
 * @param status  HTTP status code (default 200)
 */
export declare function SuccessResHandler<T>(res: Response, data: T, message?: string, status?: number): void;
/**
 * Send a standardised error response.
 *
 * @param res     Express Response object
 * @param error   Short error message
 * @param status  HTTP status code (default 400)
 * @param details Optional array of validation / debug details
 */
export declare function ErrorResHandler(res: Response, error: string, status?: number, details?: string[]): void;
//# sourceMappingURL=responseHandlers.d.ts.map