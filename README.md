# 크라우드펀딩 플랫폼

## 폴더 구조

```
src/
├── main.jsx              # React 마운트 진입점
├── App.jsx               # RouterProvider 래퍼
├── router/
│   └── index.jsx         # ★ 새 페이지 추가는 여기에
├── styles/
│   ├── variables.css     # 디자인 토큰 (색상, 간격, 폰트 등)
│   └── globals.css       # 전역 리셋 + 유틸 클래스
├── data/
│   └── mockData.js       # 임시 데이터 (API 연동 후 삭제)
├── utils/
│   └── format.js         # 금액/날짜 포매팅 유틸
├── hooks/
│   └── useProjects.js    # 데이터 패칭 훅 (API 교체 준비됨)
├── components/
│   ├── layout/
│   │   ├── Layout.jsx    # Header + Outlet + Footer
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── common/           # 재사용 도메인 컴포넌트
│   │   ├── ProjectCard.jsx
│   │   ├── PopularItem.jsx
│   │   └── Banner.jsx
│   └── ui/               # 순수 UI 프리미티브
│       ├── Button.jsx
│       ├── Badge.jsx
│       └── Tabs.jsx
└── pages/
    ├── Home/
    ├── Detail/
    ├── MyPage/
    ├── Search/
    ├── Category/
    ├── ProjectList/      # 인기/신규/마감임박 공용
    ├── Login/
    └── NotFound/
```

## 새 페이지 추가하는 법

1. `src/pages/새페이지/index.jsx` 생성
2. `src/router/index.jsx` 에 route 한 줄 추가

```jsx
{ path: "새경로", element: <새페이지 /> }
```

## 개발 서버

```bash
npm install
npm run dev
```

## API 연동 방법

`src/hooks/useProjects.js` 의 `setTimeout` mock 부분을 실제 fetch로 교체:

```js
const res = await fetch(`/api/projects`);
const data = await res.json();
setData(data);
```
