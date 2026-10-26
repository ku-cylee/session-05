import type { RequestHandler } from 'express';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../lib/errors.ts';
import * as posts from '../../models/posts.ts';

export const getPostList: RequestHandler = (req, res) => {
    const page = Number(req.query.page ?? 1);
    const count = Number(req.query.count ?? 20);

    if (!Number.isInteger(page) || page < 1) {
        throw new BadRequestError('Invalid page');
    }
    if (!Number.isInteger(count) || count < 1 || count > 100) {
        throw new BadRequestError('Invalid count');
    }

    res.json(posts.findPosts(page, count));
};

export const getPost: RequestHandler = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        throw new BadRequestError('Invalid post id');
    }

    const post = posts.findPost(id);
    if (!post) {
        throw new NotFoundError('Post not found');
    }

    res.json(post);
};

export const createPost: RequestHandler = (req, res) => {
    const { title, content } = req.body ?? {};

    if (!req.headers.cookie) {
        throw new UnauthorizedError('Sign in required');
    }

    if (typeof title !== 'string' || title.length < 1 || title.length > 100) {
        throw new BadRequestError('Invalid title');
    }
    if (typeof content !== 'string') {
        throw new BadRequestError('Invalid content');
    }

    const post = posts.savePost({ title, content });
    res.status(201).json(post);
};

export const updatePost: RequestHandler = (req, res) => {
    const id = Number(req.params.id);
    const { title, content } = req.body ?? {};

    if (!req.headers.cookie) {
        throw new UnauthorizedError('Sign in required');
    }

    if (!Number.isInteger(id)) {
        throw new BadRequestError('Invalid post id');
    }
    if (typeof title !== 'string' || title.length < 1 || title.length > 100) {
        throw new BadRequestError('Invalid title');
    }
    if (typeof content !== 'string') {
        throw new BadRequestError('Invalid content');
    }

    const post = posts.updatePost(id, { title, content });
    if (!post) {
        throw new NotFoundError('Post not found');
    }

    res.json(post);
};

export const deletePost: RequestHandler = (req, res) => {
    const id = Number(req.params.id);

    if (!req.headers.cookie) {
        throw new UnauthorizedError('Sign in required');
    }

    if (!Number.isInteger(id)) {
        throw new BadRequestError('Invalid post id');
    }

    if (!posts.deletePost(id)) {
        throw new NotFoundError('Post not found');
    }

    res.status(204).end();
};
