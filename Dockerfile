# 1. 베이스 이미지 설정
# Node.js 18 버전을 기반으로 하는 Alpine Linux 이미지를 사용합니다. Alpine은 가볍고 빠릅니다.
FROM node:18-alpine

# 2. 작업 디렉토리 설정
# 컨테이너 내에서 작업할 디렉토리를 생성하고 이동합니다.
WORKDIR /usr/src/app

# 3. 의존성 설치
# package.json과 package-lock.json을 먼저 복사하여 의존성을 설치합니다.
# 이렇게 하면 소스 코드가 변경되어도 매번 의존성을 새로 설치하지 않아 캐시를 활용할 수 있습니다.
COPY package*.json ./
RUN npm install

# 4. 소스 코드 복사
# 프로젝트의 모든 파일을 작업 디렉토리로 복사합니다.
COPY . .

# 5. 애플리케이션 빌드
# TypeScript 코드를 JavaScript로 컴파일합니다.
RUN npm run build

# 6. 포트 노출
# 컨테이너가 3000번 포트를 사용하도록 설정합니다.
# 실제 서버 포트와 일치해야 합니다. (현재는 기본값 3000으로 가정)
EXPOSE 3000

# 7. 애플리케이션 실행
# 컨테이너가 시작될 때 실행할 명령어를 정의합니다.
CMD ["npm", "start"]
