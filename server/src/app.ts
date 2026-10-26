import express from 'express';
import { fileURLToPath } from 'node:url';
import router from './controllers/index.ts';
import { logRequest } from './lib/log-request.ts';
import { notFound, errorHandler } from './lib/error-handler.ts';

const app = express();

app.use(express.urlencoded());
app.use(express.json());
// app.use(logRequest);

const indexHtml = fileURLToPath(new URL('../public/index.html', import.meta.url));

app.get('/', (req, res) => {
    if (!req.headers.cookie) {
        res.setHeader('Set-Cookie', 'sid=abc123; Path=/');
    }
    res.sendFile(indexHtml);
});

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);

export default app;
