# 게시판 API 서버

4회차 「서버와 API」의 Express 서버에서 데모용 form 페이지를 뺀 것. 클라이언트(`../client`)가 쓰는 API만 남아 있음.

## 실행

```bash
npm install
npm run dev
```

설정은 `.env` (`.env.example` 참고). `PORT` 기본 3000

```bash
npm test
npm run typecheck
```

## 구성

| 경로 | 역할 |
| --- | --- |
| `src/index.ts` | 서버 시작 (`listen`) |
| `src/app.ts` | 미들웨어 · 라우터 · 에러 처리 등록 |
| `src/controllers/index.ts` | `/api` 아래 자원별 라우터를 모음 |
| `src/controllers/posts/index.ts` | 게시글 라우트 표 |
| `src/controllers/posts/ctrl.ts` | 게시글 컨트롤러 |
| `src/lib/errors.ts` | 상태 코드별 에러 클래스 |
| `src/lib/error-handler.ts` | 매칭 실패 404 · 에러 처리 미들웨어 |
| `src/lib/log-request.ts` | 요청 로그 미들웨어 (기본 꺼짐) |
| `src/models/posts.ts` | 게시글 인메모리 저장소 |

## API

| 메서드 | 경로 | 기능 | 성공 | 실패 |
| --- | --- | --- | --- | --- |
| GET | `/api/posts?page=1&count=20` | 게시글 목록 | 200 | 400 |
| GET | `/api/posts/:id` | 게시글 상세 | 200 | 400 · 404 |
| POST | `/api/posts` | 게시글 생성 | 201 | 400 · 401 |
| PUT | `/api/posts/:id` | 게시글 수정 | 200 | 400 · 401 · 404 |
| DELETE | `/api/posts/:id` | 게시글 삭제 | 204 | 400 · 401 · 404 |

- 바디는 `{ "title": "...", "content": "..." }`. JSON과 urlencoded 모두 받음
- `title`은 1–100자 문자열, `content`는 문자열
- 쓰기(POST · PUT · DELETE)는 `Cookie` 헤더가 있어야 함. 값은 검사하지 않음. 클라이언트는 시작할 때 `sid=abc123`을 직접 심고, Insomnia 등에서는 헤더를 직접 넣어야 함
- 실패 응답은 모두 `{ "error": "..." }` 한 가지 형식. 매칭되지 않는 라우트도 같은 형식의 404

## 초기화

게시글은 메모리에만 있으며, 서버를 껐다 켜면 초기 6건으로 돌아감.
