<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchPosts } from '../api';
import { formatDate } from '../format';
import type { Post } from '../types';

const PAGE_SIZE = 5;

const posts = ref<Post[]>([]);
const page = ref(1);
const loading = ref(true);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    posts.value = await fetchPosts(page.value, PAGE_SIZE);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

watch(page, load, { immediate: true });
</script>

<template>
  <div class="page-head">
    <div>
      <h1 class="page-title">게시물</h1>
      <p class="page-sub">{{ page }}페이지</p>
    </div>
    <RouterLink :to="{ name: 'post-new' }" class="btn primary">글쓰기</RouterLink>
  </div>

  <div v-if="loading" class="state">불러오는 중...</div>
  <div v-else-if="error" class="state error">
    <div>{{ error }}</div>
    <button class="btn retry" @click="load">다시 시도</button>
  </div>
  <template v-else>
    <ul class="post-list">
      <li v-for="post in posts" :key="post.id">
        <RouterLink :to="{ name: 'post', params: { id: post.id } }" class="post-card">
          <h2>{{ post.title }}</h2>
          <p>{{ post.content.split('\n')[0] }}</p>
          <div class="meta">
            <span>{{ formatDate(post.createdAt) }}</span>
          </div>
        </RouterLink>
      </li>
    </ul>

    <nav class="pager">
      <button class="btn" :disabled="page === 1" @click="page--">&larr; 이전 페이지</button>
      <button class="btn" :disabled="posts.length < PAGE_SIZE" @click="page++">다음 페이지 &rarr;</button>
    </nav>
  </template>
</template>
