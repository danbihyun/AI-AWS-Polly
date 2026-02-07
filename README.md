# Amazon Polly + Node.js 실습 레포 (AI-AWS-Polly)

Amazon Polly(Text-to-Speech)를 Node.js(AWS SDK v3)로 호출해 다음을 실습합니다.
- MP3/OGG/PCM 생성
- SSML 제어
- Speech Marks 생성
- S3 저장 및 Presigned URL 재생
- **Lambda + Frontend 기반 텍스트→MP3 저장/재생 모듈**

## 프로젝트 구조
```
AI-AWS-Polly/
  server/                     # 기존 Express 실습 API
  lambda/                     # AWS Lambda 핸들러(Node.js)
  frontend/                   # 브라우저 입력/재생 UI
  infra/aws-cli-deploy-lambda.sh
  docs/
    chapters/Chapter01~10.md  # 커리큘럼형 학습 문서
```

## 1) 커리큘럼 학습
- `docs/chapters/README.md`에서 Chapter01~10 순서로 학습하세요.

## 2) Lambda 배포 (AWS CLI)
사전 요구사항
- AWS CLI 로그인 완료
- Node.js 18+
- S3 버킷 1개

```bash
AWS_REGION=ap-northeast-2 \
LAMBDA_NAME=polly-tts-lambda \
ROLE_NAME=polly-tts-lambda-role \
POLLY_S3_BUCKET=your-polly-bucket \
CORS_ALLOW_ORIGIN='*' \
./infra/aws-cli-deploy-lambda.sh
```

배포가 끝나면 Function URL이 출력됩니다.

## 3) Frontend 실행
정적 파일 서버로 `frontend/`를 열어 사용합니다.

```bash
python3 -m http.server 8080 -d frontend
# 브라우저에서 http://localhost:8080 접속
```

사용 방법
1. Lambda Function URL 입력
2. 텍스트 입력
3. Voice/Engine 선택
4. `MP3 생성 & 재생` 클릭
5. MP3가 S3에 저장되고 즉시 재생

## 4) 기존 Express 서버 사용(옵션)
```bash
cd server
npm i
export AWS_REGION=ap-northeast-2
node index.js
```

## 참고 문서
- API: `docs/api.md`
- SSML: `docs/ssml-snippets.md`
- IAM: `docs/iam-policy.md`
