<script setup lang="ts">
import { ref, watch, onWatcherCleanup } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPost, createPost, updatePost } from '../api';

// id가 있으면 수정, 없으면 새 글 작성
const props = defineProps<{ id?: string }>();
const router = useRouter();

const title = ref('');
const content = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const submitting = ref(false);
const submitError = ref<string | null>(null);

async function load(id: string | undefined) {
  // 뒤늦게 도착한 이전 요청의 응답이 최신 화면을 덮어쓰지 않게 한다
  let cancelled = false;
  onWatcherCleanup(() => {
    cancelled = true;
  });

  title.value = '';
  content.value = '';
  error.value = null;
  submitError.value = null;
  if (id === undefined) return;

  loading.value = true;
  try {
    const post = await fetchPost(id);
    if (cancelled) return;
    title.value = post.title;
    content.value = post.content;
  } catch (e) {
    if (cancelled) return;
    error.value = (e as Error).message;
  } finally {
    if (!cancelled) loading.value = false;
  }
}

async function submit() {
  submitting.value = true;
  submitError.value = null;
  try {
    const input = { title: title.value, content: content.value };
    const post = props.id ? await updatePost(props.id, input) : await createPost(input);
    router.push({ name: 'post', params: { id: post.id } });
  } catch (e) {
    submitError.value = (e as Error).message;
  } finally {
    submitting.value = false;
  }
}

watch(() => props.id, load, { immediate: true });
</script>

<template>
  <RouterLink
    v-if="id"
    :to="{ name: 'post', params: { id } }"
    class="back-link"
  >&larr; 글로 돌아가기</RouterLink>
  <RouterLink v-else to="/" class="back-link">&larr; 목록으로</RouterLink>

  <h1 class="page-title">{{ id ? '글 수정' : '새 글 작성' }}</h1>
  <p class="page-sub">
    제출하면 <code>{{ id ? `PUT /api/posts/${id}` : 'POST /api/posts' }}</code>로 보내집니다.
  </p>

  <div v-if="loading" class="state">불러오는 중...</div>
  <div v-else-if="error" class="state error">{{ error }}</div>

  <form v-else class="article" @submit.prevent="submit">
    <div class="field">
      <label for="title">제목</label>
      <input id="title" v-model="title" maxlength="100" required placeholder="100자 이내" />
      <span class="hint">필수 · 최대 100자</span>
    </div>
    <div class="field">
      <label for="content">내용</label>
      <textarea id="content" v-model="content" required placeholder="본문을 입력하세요"></textarea>
      <span class="hint">필수</span>
    </div>
    <div class="form-actions">
      <span v-if="submitError" class="form-error">{{ submitError }}</span>
      <button type="submit" class="btn primary" :disabled="submitting">
        {{ id ? '저장' : '등록' }}
      </button>
    </div>
  </form>
</template>
