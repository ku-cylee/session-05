import type { Post, PostInput } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, init);
  if (!res.ok) {
    const data: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `요청 실패 (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const fetchPosts = (page: number, count: number): Promise<Post[]> =>
  request(`/posts?page=${page}&count=${count}`);
export const fetchPost = (id: string): Promise<Post> => request(`/posts/${id}`);
export const createPost = (input: PostInput): Promise<Post> => request('/posts', json('POST', input));
export const updatePost = (id: string, input: PostInput): Promise<Post> =>
  request(`/posts/${id}`, json('PUT', input));
export const deletePost = (id: string): Promise<void> => request(`/posts/${id}`, { method: 'DELETE' });
