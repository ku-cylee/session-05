import type { ErrorRequestHandler, RequestHandler } from 'express';
import { NotFoundError } from './errors.ts';

export const notFound: RequestHandler = (req, res) => {
    throw new NotFoundError('Route not found');
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const status = err.status ?? 500;
    const message = status === 500 ? 'Internal Server Error' : err.message;
    res.status(status).json({ error: message });
};
