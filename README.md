📸 Finger Snap
사진에 담긴 이야기와 해석을 중심으로 공유하는 설명 기반 사진 커뮤니티 플랫폼입니다.

📌 소개

Finger Snap은 단순히 사진을 올리는 것을 넘어,
사진에 담긴 의도와 이야기를 함께 나누는 커뮤니티를 지향합니다.

500px, VSCO 같은 이미지 중심 플랫폼과는 다르게,
한 장의 사진에 담긴 서사와 해석을 나누는 '감상형 피드'를 제공합니다.

🖼️ 주요 기능

**회원 관리**
-   회원가입 및 로그인 (JWT 기반 인증)
-   내 정보 조회 및 프로필 관리
-   중복 체크 API (username, email)
-   회원 탈퇴 (soft delete 지원)

**사진 및 피드**
-   사진 업로드 (1장 단위, AWS S3 연동)
-   사진 설명 작성 및 감상 피드 제공 (최신순/인기순 정렬)
-   사진 상세 보기 (설명, 댓글 포함)
-   썸네일 자동 생성 (Sharp 라이브러리)
-   공개/비공개 설정
-   사진 삭제 (soft delete 지원)

**소셜 기능**
-   좋아요/취소 기능 (사진, 댓글 대상)
-   댓글 및 대댓글 시스템
-   사진 컬렉션/북마크 기능
-   사진 시리즈 생성 및 관리

**마이페이지**
-   프로필 조회 및 수정 (프로필 사진, 자기소개 등)
-   내 사진 목록 조회
-   저장한 사진 목록 (북마크)
-   좋아요한 사진 목록

**알림 시스템**
-   실시간 알림 (좋아요, 댓글, 팔로우 등)
-   알림 목록 조회 및 읽음 처리

**다국어 지원**
-   한국어, 영어, 일본어 지원
-   통합 메시지 시스템 (i18n)

🗂️ 폴더 구조

finger-snap-backend/  
├── src/  
│ ├── controllers/  
│ ├── routes/  
│ ├── middlewares/  
│ ├── services/  
│ ├── lib/  
│ ├── utils/  
│ └── server.ts  
├── prisma/  
│ └── schema.prisma  
├── .env.example  
├── package.json  
└── README.md

💡 실행 방법

# 의존성 설치

npm install

# 개발 서버 실행 (nodemon)

npm run dev

🔧 환경 변수

.env 파일을 프로젝트 루트에 만들어 주세요:

PORT=3000  
JWT_SECRET=your_secret_key  
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"  
AWS_ACCESS_KEY_ID=your_aws_access_key_id  
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key  
AWS_S3_BUCKET_NAME=your_s3_bucket_name  
AWS_REGION=your_aws_region

🚧 개발 예정 기능

-   소셜 로그인 (Google, Kakao 등) - OAuth 연동
-   알림 설정 on/off 기능
-   고급 Validation 에러 메시지 시스템

👤 개발자

- 민종현 [(GitHub 프로필)](https://github.com/straightmin)
- 이재성 [(Github 프로필)](https://github.com/jaejae3785)

📄 License

MIT
