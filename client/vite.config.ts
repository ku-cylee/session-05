import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.PORT ?? 4000);

  // 개발 중에는 Vite가 /api 요청을 API 서버로 넘긴다.
  // 운영에서는 nginx가 같은 역할을 맡아 FE와 BE가 한 오리진으로 묶인다.
  const proxy = { '/api': env.API_URL ?? 'http://localhost:3000' };

  return {
    plugins: [vue()],
    server: { port, strictPort: true, proxy },
    preview: { port, strictPort: true, proxy },
  };
});
