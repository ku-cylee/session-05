import { Router } from 'express';
import posts from './posts/index.ts';

const router = Router();

router.use('/posts', posts);

export default router;
