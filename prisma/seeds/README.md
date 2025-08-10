# 🌱 epiksode 샘플데이터 생성 시스템

Phase 3 프론트엔드 API 연동을 위한 완전한 샘플데이터 생성 시스템입니다.

## 🚀 빠른 시작

### 1. 환경 설정 확인
```bash
# 환경변수 설정 (DATABASE_URL 등)
cp .env.example .env

# 의존성 설치 확인
npm install

# Prisma 클라이언트 생성
npx prisma generate
```

### 2. 샘플데이터 생성
```bash
# 모든 샘플데이터 생성 (권장)
npm run seed

# 검증 실행
npm run seed:verify
```

## 📊 생성되는 데이터

### 🎯 Priority 1: 필수 데이터
- **👥 사용자**: 5명 (한국어 프로필, 실제 패스워드)
- **📸 사진**: 20장 (사용자별 4장씩 분산)
- **❤️ 좋아요**: 분산된 참여도 (0-2000개)
- **💬 댓글**: 일반댓글 + 대댓글 (한국어)

### 🎯 Priority 2: 확장 데이터  
- **📁 시리즈**: 3개 (테마별 사진 묶음)
- **👥 팔로우**: 15개 관계 (상호/일방향)
- **🔔 알림**: 자동 트리거 (좋아요/댓글/팔로우)
- **🔖 컬렉션**: 5개 (북마크 모음)

## 📝 생성된 샘플 계정

| 사용자 | 이메일 | 패스워드 | 특성 |
|--------|--------|----------|------|
| nature_kim | nature.photographer@example.com | `nature123!` | 자연 사진 전문 |
| city_park | city.explorer@example.com | `city123!` | 도시 야경 전문 |
| forest_lee | forest.walker@example.com | `forest123!` | 숲길 산책 전문 |
| sea_choi | sea.dreamer@example.com | `sea123!` | 바다 풍경 전문 |
| star_jung | star.gazer@example.com | `star123!` | 밤하늘/별 전문 |

## 🏗️ 아키텍처

```
prisma/seeds/
├── seed.ts              # 🎯 마스터 시드 스크립트
├── data/                # 📋 샘플 데이터 정의
│   ├── users.data.ts
│   ├── photos.data.ts
│   └── comments.data.ts
├── seeders/             # ⚙️ 개별 시더 스크립트
│   ├── users.seeder.ts
│   ├── photos.seeder.ts
│   ├── likes.seeder.ts
│   ├── comments.seeder.ts
│   ├── follows.seeder.ts
│   ├── series.seeder.ts
│   ├── collections.seeder.ts
│   └── notifications.seeder.ts
└── utils/               # 🔧 유틸리티
    ├── logger.ts
    └── verify.ts
```

## 🔍 데이터 검증

### 자동 검증 실행
```bash
npm run seed:verify
```

### 검증 항목
- ✅ **기본 데이터 수량**: 최소 요구사항 충족 여부
- ✅ **데이터 품질**: 프로필 완성도, 메타데이터 무결성  
- ✅ **관계형 데이터**: Foreign Key 일관성, 다형성 관계
- ✅ **API 연동 준비도**: 프론트엔드 API 요구사항 충족

## 📱 API 연동 테스트

### 주요 엔드포인트 확인
```bash
# 서버 실행
npm run dev

# API 테스트
curl http://localhost:3000/api/photos
curl http://localhost:3000/api/users/1
curl http://localhost:3000/api/notifications
```

### 인증 테스트
```bash
# 로그인 (샘플 계정)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nature.photographer@example.com","password":"nature123!"}'

# 토큰 사용
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎨 데이터 특징

### 📸 사진 분산 전략
- **인기 사진**: 1000+ 좋아요 (star_jung의 "사막의 별" 등)
- **보통 사진**: 300-1000 좋아요 (대부분의 사진)
- **신규 사진**: 100-300 좋아요 (최근 업로드)

### 💬 댓글 패턴
- **일반 댓글**: 70% (다양한 길이의 한국어 댓글)
- **대댓글**: 30% (작성자 답변 위주)
- **참여 시점**: 사진 업로드 후 자연스러운 시간 분산

### 👥 팔로우 네트워크
- **상호 팔로우**: nature_kim ↔ city_park, forest_lee ↔ sea_choi
- **인기 사용자**: star_jung (5명 팔로워), nature_kim (4명 팔로워)  
- **실제적 관계**: 취향 기반 팔로우 패턴

## 🛠️ 고급 사용법

### 개별 시더 실행
```bash
# TypeScript 직접 실행 (tsx 사용)
npx tsx prisma/seeds/seeders/users.seeder.ts
npx tsx prisma/seeds/seeders/photos.seeder.ts
```

### 데이터 초기화
```bash
# 개발 환경에서만 (seed.ts가 자동 처리)
npm run seed  # 기존 데이터 자동 정리 후 재생성
```

### 커스터마이징
- `data/` 폴더의 데이터 파일 수정
- `seeders/` 폴더의 로직 조정
- 새로운 시더 추가 시 `seed.ts`에서 import 및 호출

## 📋 체크리스트

### Phase 3 연동 전 확인사항
- [ ] `npm run seed` 성공적으로 실행 ✅
- [ ] `npm run seed:verify` 모든 검증 통과 ✅  
- [ ] API 서버 정상 구동 (`npm run dev`) ✅
- [ ] 샘플 계정으로 로그인 성공 ✅
- [ ] 사진 목록 API 응답 확인 ✅
- [ ] 알림 API 응답 확인 ✅

### 품질 확인사항  
- [ ] 모든 사진에 유효한 이미지 URL ✅
- [ ] 한국어 프로필 및 댓글 완성 ✅
- [ ] 다양한 참여도 분산 (인기사진 vs 신규사진) ✅
- [ ] 댓글-대댓글 관계 정상 구성 ✅
- [ ] 팔로우 관계의 상호/일방향 다양성 ✅

## 🚨 트러블슈팅

### 자주 발생하는 오류
1. **Database connection error**: DATABASE_URL 환경변수 확인
2. **Prisma client not generated**: `npx prisma generate` 실행
3. **Foreign key constraint**: 기존 데이터와 충돌 시 DB 초기화

### 성능 최적화
- 대량 데이터 생성 시 배치 처리 사용
- 트랜잭션으로 데이터 일관성 보장
- 인덱싱된 컬럼 활용한 조회 최적화

## 📞 지원

문제 발생 시:
1. `npm run seed:verify` 로 상세 오류 확인
2. 로그 메시지 참고하여 문제 지점 파악
3. 개별 시더 단위로 테스트 진행

---

**생성일**: 2025년 8월 10일  
**버전**: 1.0  
**호환**: Prisma + PostgreSQL + TypeScript