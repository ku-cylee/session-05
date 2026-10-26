# 5회차 데모 앱

## server/

4회차 API 서버 그대로.

```bash
cd server
npm install
npm run dev
```

## client/

```bash
cd client
npm install
npm run dev
```

접속: http://localhost:4000

`/api` 요청은 Vite 개발 서버가 `http://localhost:3000`으로 넘김. 운영에서는 nginx가 이 역할을 맡음.

빌드: `npm run build` → `dist/`
