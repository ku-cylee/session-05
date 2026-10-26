import { createRouter, createWebHistory } from 'vue-router';
import PostList from './views/PostList.vue';
import PostDetail from './views/PostDetail.vue';
import PostForm from './views/PostForm.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'posts', component: PostList },
    { path: '/posts/new', name: 'post-new', component: PostForm },
    { path: '/posts/:id', name: 'post', component: PostDetail, props: true },
    { path: '/posts/:id/edit', name: 'post-edit', component: PostForm, props: true },
  ],
});
