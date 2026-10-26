import type { RequestHandler } from 'express';

export const logRequest: RequestHandler = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    console.log('  query   :', { ...req.query });
    console.log('  headers :', req.headers);
    console.log('  body    :', req.body);
    next();
};
