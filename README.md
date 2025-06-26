📸 Finger Snap
사진에 담긴 이야기와 해석을 중심으로 공유하는 설명 기반 사진 커뮤니티 플랫폼입니다.

📌 소개

Finger Snap은 단순히 사진을 올리는 것을 넘어,
사진에 담긴 의도와 이야기를 함께 나누는 커뮤니티를 지향합니다.

500px, VSCO 같은 이미지 중심 플랫폼과는 다르게,
한 장의 사진에 담긴 서사와 해석을 나누는 '감상형 피드'를 제공합니다.

🖼️ 주요 기능

회원가입 및 로그인 (JWT 기반 인증)

사진 업로드 (1장 단위)

사진 설명 작성 및 감상 피드 제공

좋아요, 댓글 및 대댓글 기능

사진 여러 개 저장 (북마크 기능)

마이페이지 (내 사진, 내 저장 목록, 프로필 편집)

soft delete 지원 (삭제 대신 비활성화 처리)

🗂️ 폴더 구조

finger-snap-backend/
├── src/
│ ├── controllers/
│ ├── routes/
│ ├── middlewares/
│ ├── models/
│ └── index.js
├── .gitignore
├── .gitattributes
├── package.json
└── README.md

💡 실행 방법

# 의존성 설치

npm install

# 개발 서버 실행 (nodemon)

npm run dev

🔧 환경 변수

.env 파일을 프로젝트 루트에 만들어 주세요:

PORT=4000
JWT_SECRET=your_secret_key
DB_URL=mongodb://localhost:27017/finger-snap

.env.example 템플릿 파일도 추후 제공 예정입니다.

🚧 개발 예정 기능

👤 개발자

민종현 (GitHub 프로필)

📄 License

MIT
