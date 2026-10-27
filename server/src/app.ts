import express from 'express';
import router from './controllers/index.ts';
import { logRequest } from './lib/log-request.ts';
import { notFound, errorHandler } from './lib/error-handler.ts';

const app = express();

app.use(express.urlencoded());
app.use(express.json());
// app.use(logRequest);

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);

export default app;
