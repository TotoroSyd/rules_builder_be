import { Response } from 'express';
import { ApiSuccessPayload, ApiErrorPayload } from '../types';

/**
 * Send a standardised success response.
 *
 * @param res     Express Response object
 * @param data    Payload to include under `data`
 * @param message Optional human-readable message
 * @param status  HTTP status code (default 200)
 */
export function SuccessResHandler<T>(
  res: Response,
  data: T,
  message?: string,
  status = 200,
): void {
  const payload: ApiSuccessPayload<T> = {
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
export function ErrorResHandler(
  res: Response,
  error: string,
  status = 400,
  details?: string[],
): void {
  const payload: ApiErrorPayload = {
    success: false,
    error,
    ...(details?.length ? { details } : {}),
  };
  console.error(`Error: ${status} - ${error} - Details:`, details);
  res.status(status).json(payload);
}
