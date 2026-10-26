export interface Post {
    id: number;
    title: string;
    content: string;
    createdAt: string;
}

export interface PostInput {
    title: string;
    content: string;
}

const posts: Post[] = [
    {
        id: 1,
        title: 'FE와 BE를 분리하면서 겪은 첫 번째 벽, CORS',
        content: `프론트엔드를 별도 서버로 떼어내고 처음 API를 호출했을 때 브라우저 콘솔에 붉은 글씨가 떴다. "blocked by CORS policy".

서버는 분명 200을 돌려줬는데 브라우저가 응답을 읽지 못하게 막은 것이다. 이 정책은 서버가 아니라 브라우저가 집행한다는 점이 처음에는 낯설었다.

해결은 서버가 Access-Control-Allow-Origin 헤더에 프론트엔드의 오리진을 명시해 주는 것으로 끝났다. 와일드카드보다 정확한 오리진을 적는 편이 안전하다.`,
        createdAt: '2026-08-20T09:12:00+09:00',
    },
    {
        id: 2,
        title: 'SPA에서 새로고침하면 404가 나는 이유',
        content: `/posts/3 같은 경로에서 F5를 누르면 정적 서버는 posts/3 이라는 파일을 찾는다. 당연히 없다.

Vue Router가 만든 경로는 브라우저 안에서만 의미가 있다. 정적 서버는 그 존재를 모른다.

그래서 서버 설정에 "없는 경로는 전부 index.html로" 라는 규칙을 넣어야 한다. Nginx라면 try_files 한 줄이고, Vite 개발 서버는 기본으로 이 동작을 해 준다.`,
        createdAt: '2026-08-22T14:30:00+09:00',
    },
    {
        id: 3,
        title: 'ref와 reactive, 언제 무엇을 쓸까',
        content: `Vue 3의 Composition API를 처음 만나면 ref와 reactive 중 무엇을 써야 하는지 헷갈린다.

원시값과 객체 모두 ref로 감싸는 방식이 가장 일관된다. 템플릿에서는 자동으로 언래핑되고, 스크립트에서는 .value로 접근한다는 규칙 하나만 기억하면 된다.

reactive는 객체 전용이고 구조 분해하면 반응성이 끊긴다. 이 함정 때문에 팀 컨벤션을 ref 하나로 통일하는 경우가 많다.`,
        createdAt: '2026-08-25T11:05:00+09:00',
    },
    {
        id: 4,
        title: 'Express에서 JSON API만 남기기',
        content: `서버 렌더링 시절에는 Express가 템플릿 엔진으로 HTML을 만들어 보냈다. 이제는 그 역할이 사라졌다.

라우터에는 res.json만 남는다. 뷰 엔진 설정, 정적 파일 서빙, 레이아웃 파일이 모두 지워지고 나면 서버 코드가 놀랄 만큼 얇아진다.

남은 관심사는 데이터의 형태와 상태 코드다. 404를 언제 돌려줄지, 목록과 상세의 응답 스키마를 어떻게 다르게 할지 같은 것들이다.`,
        createdAt: '2026-08-27T16:48:00+09:00',
    },
    {
        id: 5,
        title: '이전 글, 다음 글 버튼은 누가 계산해야 하나',
        content: `상세 페이지에 이전/다음 이동 버튼을 넣으려면 인접한 글의 id가 필요하다. 이걸 클라이언트가 계산할지 서버가 내려줄지 고민이 된다.

클라이언트가 목록 전체를 들고 있다면 직접 계산할 수 있다. 하지만 상세 페이지로 바로 진입하는 경우 목록이 없다.

그래서 상세 응답에 prev와 next를 함께 담아 주는 편이 단순하다. 정렬 기준이 바뀌어도 서버 한 곳만 고치면 된다.`,
        createdAt: '2026-08-30T10:20:00+09:00',
    },
    {
        id: 6,
        title: '개발 서버 두 개를 동시에 띄우는 습관',
        content: `FE와 BE가 분리되면 터미널 두 개가 기본이 된다. 하나는 Vite, 하나는 Node.

처음에는 번거롭지만 각자의 로그가 섞이지 않아 디버깅이 편해진다. 어느 쪽 문제인지 즉시 구분된다.

배포 환경도 이 구조를 그대로 따른다. 정적 호스팅 하나, API 서버 하나. 로컬에서의 두 터미널이 곧 운영 구조의 축소판이다.`,
        createdAt: '2026-09-01T08:55:00+09:00',
    },
];

let nextId = posts.length + 1;

export function findPosts(page: number, count: number): Post[] {
    const start = (page - 1) * count;
    return posts.slice(start, start + count);
}

export function findPost(id: number): Post | null {
    return posts.find((p) => p.id === id) ?? null;
}

export function savePost(input: PostInput): Post {
    const post: Post = {
        id: nextId++,
        ...input,
        createdAt: new Date().toISOString(),
    };
    posts.push(post);
    return post;
}

export function updatePost(id: number, input: PostInput): Post | null {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    posts[index] = { ...posts[index], ...input };
    return posts[index];
}

export function deletePost(id: number): boolean {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    posts.splice(index, 1);
    return true;
}
