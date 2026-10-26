# 4회차 데모 앱 : 게시판 API 서버

사내 웹 세미나 4회차 「서버와 API」의 데모용 Express 서버. 슬라이드 2장의 라우트 표와 4장의 컨트롤러 코드를 그대로 담고 있음.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속. 요청마다 쿼리 · 헤더 · 바디가 터미널에 찍히므로, 브라우저 · Insomnia 옆에 이 터미널을 같이 띄워 둘 것.

```bash
npm test    # 테스트
npm run typecheck
```

## 구성

| 경로 | 역할 |
| --- | --- |
| `src/index.ts` | 서버 시작 (`listen`) |
| `src/app.ts` | 미들웨어 · 라우터 · 에러 처리 등록. 슬라이드 1장 도표의 순서. `GET /`에서 form 페이지를 내려주며 쿠키를 심음 |
| `public/index.html` | 게시글 작성 form 페이지. 콘솔 `fetch()` 데모도 이 페이지에서 실행 |
| `src/controllers/index.ts` | `/api` 아래 자원별 라우터를 모음 |
| `src/controllers/posts/index.ts` | 게시글 라우트 표 (2장) |
| `src/controllers/posts/ctrl.ts` | 게시글 컨트롤러 (4장) |
| `src/lib/errors.ts` | 상태 코드별 에러 클래스 |
| `src/lib/error-handler.ts` | 매칭 실패 404 · 에러 처리 미들웨어 |
| `src/lib/log-request.ts` | 요청 로그 미들웨어 (3장 네 통로 확인용) |
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
- 쓰기(POST · PUT · DELETE)는 `Cookie` 헤더가 있어야 함. 값은 검사하지 않음 (인증은 § 8)
  - `GET /`가 `Set-Cookie: sid=abc123`을 심으므로, 브라우저(form · `fetch()`)는 자동으로 통과하고 Insomnia는 헤더를 직접 넣어야 함
- 실패 응답은 모두 `{ "error": "..." }` 한 가지 형식. 매칭되지 않는 라우트도 같은 형식의 404

## 데모 순서

### form · 콘솔 `fetch()` · Insomnia 비교

1. 브라우저로 `http://localhost:3000` 접속 → 터미널에 `GET /` 로그, 응답 헤더에 `Set-Cookie`
2. form에서 제목을 101자 입력 시도 → `maxlength`로 입력이 막힘 (FE 검증)
3. 같은 페이지의 DevTools 콘솔에서 아래를 실행 → 400 (FE 검증 우회, 서버 검증이 막음)

   ```js
   const res = await fetch('/api/posts', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title: 'a'.repeat(1000), content: 'x' }),
   })
   await res.json()
   ```

4. form을 정상 제출 → 201 JSON이 화면에 그대로 뜸. 같은 요청을 Insomnia로 쿠키 없이 → 401, `Cookie: sid=abc123` 넣고 → 201
5. 터미널 로그에서 form(urlencoded) · `fetch()`(JSON) · Insomnia 세 요청의 쿼리 · 헤더 · 바디를 비교

### 라우트별 확인 (Insomnia)

1. `GET /api/posts` → 200, 목록 6건. `?page=2&count=4` → 2건. `?count=1000` → 400
2. `GET /api/posts/4` → 200. `/api/posts/title-name` → 400. `/api/posts/999` → 404
3. `POST /api/posts` (쿠키 없이) → 401
4. 헤더에 `Cookie: sid=abc123` 추가 후, 바디 `{ "title": "" }` → 400
5. 바디 `{ "title": "Hello", "content": "World" }` → 201, `id: 7`
6. `PUT /api/posts/7` → 200. `DELETE /api/posts/7` → 204. 다시 `GET /api/posts/7` → 404
7. `PATCH /api/posts/1` · `GET /api/posts/1/comments` → 라우트 없음, 404

각 단계마다 터미널 로그에서 쿼리 · 헤더 · 바디가 어떻게 들어왔는지 확인.

## 초기화

게시글은 메모리에만 있으며, 서버를 껐다 켜면 초기 6건으로 돌아감.
