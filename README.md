# 5회차 데모 앱

## server/

4회차 API 서버 그대로.

```bash
cd server
npm install
npm run dev
```

설정은 `.env` (`.env.example` 참고). `PORT` 기본 3000

## client/

```bash
cd client
npm install
npm run dev
```

접속: http://localhost:4000

설정은 `.env` (`.env.example` 참고). `PORT` 기본 4000, `/api` 요청은 Vite 개발 서버가 `API_URL`(기본 `http://localhost:3000`)로 넘김. 운영에서는 nginx가 이 역할을 맡음.

빌드: `npm run build` → `dist/`
