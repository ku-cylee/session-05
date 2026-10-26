import { Router } from 'express';
import { getPostList, getPost, createPost, updatePost, deletePost } from './ctrl.ts';

const router = Router();

router.get('/', getPostList);
router.get('/:id', getPost);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
