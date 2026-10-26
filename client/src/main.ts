import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';

// 쓰기 API는 Cookie 헤더가 있어야 통과한다. 서버의 GET /가 심는 값과 같다.
document.cookie = 'sid=abc123; Path=/';

createApp(App).use(router).mount('#app');
