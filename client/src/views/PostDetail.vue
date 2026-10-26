<script setup lang="ts">
import { ref, computed, watch, onWatcherCleanup } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPost, deletePost } from '../api';
import { formatDate } from '../format';
import type { Post } from '../types';

const props = defineProps<{ id: string }>();
const router = useRouter();

const post = ref<Post | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const deleting = ref(false);
const deleteError = ref<string | null>(null);

const paragraphs = computed(() => (post.value ? post.value.content.split(/\n\s*\n/) : []));

async function load(id: string) {
  // 뒤늦게 도착한 이전 요청의 응답이 최신 화면을 덮어쓰지 않게 한다
  let cancelled = false;
  onWatcherCleanup(() => {
    cancelled = true;
  });

  loading.value = true;
  error.value = null;
  try {
    const data = await fetchPost(id);
    if (cancelled) return;
    post.value = data;
  } catch (e) {
    if (cancelled) return;
    post.value = null;
    error.value = (e as Error).message;
  } finally {
    if (!cancelled) loading.value = false;
  }
}

async function remove() {
  if (!confirm('이 글을 삭제할까요?')) return;
  deleting.value = true;
  deleteError.value = null;
  try {
    await deletePost(props.id);
    router.push({ name: 'posts' });
  } catch (e) {
    deleteError.value = (e as Error).message;
    deleting.value = false;
  }
}

watch(() => props.id, load, { immediate: true });
</script>

<template>
  <RouterLink to="/" class="back-link">&larr; 목록으로</RouterLink>

  <div v-if="loading" class="state">불러오는 중...</div>
  <div v-else-if="error" class="state error">{{ error }}</div>

  <template v-else-if="post">
    <article class="article">
      <h1>{{ post.title }}</h1>
      <div class="meta">
        <span>{{ formatDate(post.createdAt) }}</span>
      </div>
      <div class="article-body">
        <p v-for="(paragraph, i) in paragraphs" :key="i">{{ paragraph }}</p>
      </div>
    </article>

    <div class="article-actions">
      <span v-if="deleteError" class="form-error">{{ deleteError }}</span>
      <RouterLink :to="{ name: 'post-edit', params: { id } }" class="btn">수정</RouterLink>
      <button class="btn danger" :disabled="deleting" @click="remove">삭제</button>
    </div>
  </template>
</template>
