# 🎯 Fundit — 크라우드펀딩 플랫폼

> 창작자와 후원자를 잇는 공간

**배포 URL**: https://fundit.yeon.monster

| 역할 | 링크 |
|------|------|
| 프론트엔드 | https://github.com/yeon02204/funding_frontend |
| 백엔드 | https://github.com/yeon02204/funding |

---

## 🖥️ 테스트 계정

| 구분 | 이메일 | 비밀번호 |
|------|--------|---------|
| 관리자 | admin@yeon.monster | fundit1234! |
| 일반 유저 | user@yeon.monster | fundit1234! |

---

## 🛠️ 기술 스택

### Backend
![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.11-green)
![Spring Security](https://img.shields.io/badge/Spring_Security-6-green)
![JPA](https://img.shields.io/badge/JPA-Hibernate-blue)
![MySQL](https://img.shields.io/badge/MySQL-9.4-blue)
![Redis](https://img.shields.io/badge/Redis-latest-red)
![JWT](https://img.shields.io/badge/JWT-0.12.6-black)
![AWS S3](https://img.shields.io/badge/AWS_S3-SDK_v2-orange)

### Frontend
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![React Router](https://img.shields.io/badge/React_Router-7-red)

### DevOps
![Railway](https://img.shields.io/badge/Railway-Backend-purple)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-black)
![Resend](https://img.shields.io/badge/Resend-Email-blue)

---

## 📋 주요 기능

### 👤 회원
- 이메일 회원가입 (이메일 인증 포함)
- JWT 기반 로그인 / 로그아웃
- OAuth2 소셜 로그인 (카카오, 네이버)
- 닉네임 · 프로필 이미지 수정
- 비밀번호 변경 / 재설정 (이메일 링크)
- 회원 탈퇴 (소프트 삭제 + 이메일 익명화)
- 팔로우 / 팔로잉

### 📦 프로젝트
- 프로젝트 등록 / 수정 / 삭제
- 카테고리 · 태그 분류
- 프로젝트 상태 관리 (DRAFT → PENDING → APPROVED → FUNDING → SUCCESS/FAILED)
- 이미지 업로드 (AWS S3)
- 좋아요 / 조회수
- 검색 (키워드 · 카테고리 · 태그 · 정렬)
- 인기순 · 신규순 · 마감임박순 · 공개예정 필터

### 💰 후원
- 프로젝트 후원 (목표 금액 달성률 실시간 반영)
- 후원 취소 / 환불
- 관리자 전체 환불 처리

### 🔐 보안
- Refresh Token Redis 저장 (자동 만료)
- 이메일 인증 코드 Redis 저장 (5분 TTL, 1회용)
- 비밀번호 재설정 UUID 토큰 (30분 만료)
- BCrypt 비밀번호 암호화

### 🛡️ 관리자
- 회원 목록 조회 · 정지 · 해제
- 프로젝트 승인 / 반려 / 강제 중단
- 카테고리 CRUD
- 통계 대시보드 (회원 · 프로젝트 · 후원 현황)

---

## 🏗️ 아키텍처

```
[Browser]
    │
    ▼
[Vercel - React/Vite]
    │  REST API (HTTPS)
    ▼
[Railway - Spring Boot]
    ├── MySQL (Railway)
    ├── Redis (Railway)
    └── AWS S3 (이미지)
         └── Resend API (이메일)
```

---

## 📁 프로젝트 구조

### Backend
```
src/main/java/com/funding/funding/
├── domain/
│   ├── user/          # 회원, 인증, OAuth2
│   ├── project/       # 프로젝트, 좋아요, 태그
│   ├── donation/      # 후원, 환불
│   ├── category/      # 카테고리
│   └── statistics/    # 통계
└── global/
    ├── config/        # CORS, Security, S3, Redis
    ├── exception/     # 전역 예외 처리
    ├── response/      # 공통 응답 형식
    └── security/      # JWT 필터
```

### Frontend
```
src/
├── api/           # axios 클라이언트 + API 모듈
├── components/    # 공통 UI 컴포넌트
├── context/       # AuthContext
├── hooks/         # useProjects 등 커스텀 훅
├── pages/         # 라우트별 페이지
└── data/          # 정적 데이터
```

---

## 🔑 환경 변수

### Backend (Railway)
```
DB_URL=jdbc:mysql://...
DB_USERNAME=root
DB_PASSWORD=...
JWT_SECRET=...
JWT_ACCESS_TOKEN_EXP_MINUTES=15
JWT_REFRESH_TOKEN_EXP_DAYS=7
SPRING_DATA_REDIS_URL=redis://...
AWS_S3_BUCKET=...
AWS_S3_REGION=ap-northeast-2
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
RESEND_API_KEY=...
RESEND_FROM=Fundit@yeon.monster
FRONTEND_URL=https://fundit.yeon.monster
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
```

### Frontend (Vercel)
```
VITE_API_URL=https://funding-production-4c43.up.railway.app
```

---

## ⚠️ 이메일 인증 안내

이메일 인증 기능이 구현되어 있으며 실제로 동작합니다.

단, 회원가입 시 **실제 이메일 주소**를 사용해야 인증 코드를 받을 수 있습니다. `@yeon.monster` 도메인 계정은 Resend를 통해 발송됩니다.

---

## 📝 API 문서

백엔드 서버 실행 후 Swagger UI에서 확인 가능합니다.

```
https://funding-production-4c43.up.railway.app/swagger-ui/index.html
```
