import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import app from '../src/app.ts';

let server: Server;
let base: string;

before(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const { port } = server.address() as { port: number };
    base = `http://localhost:${port}`;
});

after(() => server.close());

const json = (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) =>
    fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

const signedIn = { Cookie: 'sid=abc123' };

describe('GET /api/posts', () => {
    it('returns the first page with default count', async () => {
        const res = await fetch(`${base}/api/posts`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.length, 6);
        assert.equal(body[0].id, 1);
    });

    it('paginates with page and count', async () => {
        const res = await fetch(`${base}/api/posts?page=2&count=4`);
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.deepEqual(body.map((p: { id: number }) => p.id), [5, 6]);
    });

    it('rejects invalid page and count', async () => {
        for (const q of ['page=0', 'page=abc', 'count=0', 'count=101', 'page=1&page=2']) {
            const res = await fetch(`${base}/api/posts?${q}`);
            assert.equal(res.status, 400, q);
            assert.match((await res.json()).error, /^Invalid/);
        }
    });
});

describe('GET /api/posts/:id', () => {
    it('returns the post', async () => {
        const res = await fetch(`${base}/api/posts/4`);
        assert.equal(res.status, 200);
        assert.equal((await res.json()).title, 'Express에서 JSON API만 남기기');
    });

    it('returns 400 for a non-numeric id', async () => {
        const res = await fetch(`${base}/api/posts/title-name`);
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), { error: 'Invalid post id' });
    });

    it('returns 404 for a missing post', async () => {
        const res = await fetch(`${base}/api/posts/999`);
        assert.equal(res.status, 404);
        assert.deepEqual(await res.json(), { error: 'Post not found' });
    });
});

describe('POST /api/posts', () => {
    it('returns 401 without a cookie', async () => {
        const res = await json('POST', '/api/posts', { title: 'Hello', content: 'World' });
        assert.equal(res.status, 401);
        assert.deepEqual(await res.json(), { error: 'Sign in required' });
    });

    it('returns 400 for an invalid title', async () => {
        for (const body of [{}, { title: '' }, { title: 'a'.repeat(101) }, { title: 123 }]) {
            const res = await json('POST', '/api/posts', { content: 'x', ...body }, signedIn);
            assert.equal(res.status, 400);
            assert.deepEqual(await res.json(), { error: 'Invalid title' });
        }
    });

    it('returns 400 for a missing content', async () => {
        const res = await json('POST', '/api/posts', { title: 'Hello' }, signedIn);
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), { error: 'Invalid content' });
    });

    it('returns 400 for a malformed JSON body', async () => {
        const res = await fetch(`${base}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...signedIn },
            body: '{"title": ',
        });
        assert.equal(res.status, 400);
        assert.equal(typeof (await res.json()).error, 'string');
    });

    it('creates a post from a JSON body', async () => {
        const res = await json('POST', '/api/posts', { title: 'Hello', content: 'World' }, signedIn);
        assert.equal(res.status, 201);
        const post = await res.json();
        assert.equal(post.id, 7);
        assert.equal(post.title, 'Hello');
        assert.equal(post.content, 'World');
        assert.ok(post.createdAt);

        const check = await fetch(`${base}/api/posts/7`);
        assert.equal(check.status, 200);
    });

    it('creates a post from a urlencoded body', async () => {
        const res = await fetch(`${base}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...signedIn },
            body: new URLSearchParams({ title: 'Form', content: 'Body' }),
        });
        assert.equal(res.status, 201);
        assert.equal((await res.json()).id, 8);
    });
});

describe('PUT /api/posts/:id', () => {
    it('returns 401 without a cookie', async () => {
        const res = await json('PUT', '/api/posts/1', { title: 'A', content: 'B' });
        assert.equal(res.status, 401);
    });

    it('returns 400 for a non-numeric id', async () => {
        const res = await json('PUT', '/api/posts/x', { title: 'A', content: 'B' }, signedIn);
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), { error: 'Invalid post id' });
    });

    it('returns 400 for an invalid body', async () => {
        const res = await json('PUT', '/api/posts/1', { title: '' }, signedIn);
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), { error: 'Invalid title' });
    });

    it('returns 404 for a missing post', async () => {
        const res = await json('PUT', '/api/posts/999', { title: 'A', content: 'B' }, signedIn);
        assert.equal(res.status, 404);
    });

    it('replaces title and content', async () => {
        const res = await json('PUT', '/api/posts/1', { title: 'New', content: 'Text' }, signedIn);
        assert.equal(res.status, 200);
        const post = await res.json();
        assert.equal(post.id, 1);
        assert.equal(post.title, 'New');
        assert.equal(post.content, 'Text');
        assert.equal(post.createdAt, '2026-08-20T09:12:00+09:00');
    });
});

describe('DELETE /api/posts/:id', () => {
    it('returns 401 without a cookie', async () => {
        const res = await fetch(`${base}/api/posts/2`, { method: 'DELETE' });
        assert.equal(res.status, 401);
    });

    it('returns 404 for a missing post', async () => {
        const res = await fetch(`${base}/api/posts/999`, { method: 'DELETE', headers: signedIn });
        assert.equal(res.status, 404);
    });

    it('deletes the post with 204', async () => {
        const res = await fetch(`${base}/api/posts/2`, { method: 'DELETE', headers: signedIn });
        assert.equal(res.status, 204);
        assert.equal(await res.text(), '');

        const check = await fetch(`${base}/api/posts/2`);
        assert.equal(check.status, 404);
    });
});

describe('unmatched routes', () => {
    it('returns a JSON 404', async () => {
        for (const [method, path] of [['GET', '/api/posts/8/comments'], ['PATCH', '/api/posts/1'], ['GET', '/nope']]) {
            const res = await fetch(base + path, { method, headers: signedIn });
            assert.equal(res.status, 404, `${method} ${path}`);
            assert.deepEqual(await res.json(), { error: 'Route not found' });
        }
    });
});
