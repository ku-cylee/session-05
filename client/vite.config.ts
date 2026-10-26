import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 개발 중에는 Vite가 /api 요청을 API 서버로 넘긴다.
// 운영에서는 nginx가 같은 역할을 맡아 FE와 BE가 한 오리진으로 묶인다.
const proxy = { '/api': 'http://localhost:3000' };

export default defineConfig({
  plugins: [vue()],
  server: { port: 4000, strictPort: true, proxy },
  preview: { port: 4000, strictPort: true, proxy },
});
