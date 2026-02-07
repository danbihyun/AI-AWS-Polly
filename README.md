# Amazon Polly + Node.js 실습 레포 (polly-lab)

Amazon Polly(Text-to-Speech)를 Node.js(AWS SDK v3)로 호출해
- **MP3/OGG/PCM 생성**
- **SSML(발음/속도/톤/사일런스)**
- **Speech Marks(자막 타이밍/워드/문장 단위)**
- (옵션) **S3 저장 및 Presigned URL 제공**
까지 한 번에 실습할 수 있는 예제입니다.

## 구성
```
polly-lab/
  server/
    index.js
    pollyClient.js
    s3Client.js
    package.json
  scripts/
    synthesize-cli.js
    make-subtitles-from-marks.js
  docs/
    polly-curriculum.md
    api.md
    ssml-snippets.md
    iam-policy.md
  postman/
    Polly-Lab.postman_collection.json
    Polly-Lab.postman_environment.json
```

## 사전 준비
- Node.js 18+
- AWS 자격 증명 설정(환경변수/프로파일/EC2 역할 등)
- (옵션) S3 버킷

## 빠른 시작
```bash
cd server
npm i

export AWS_REGION=ap-northeast-2
# 기본은 Base64로 바이너리 반환. S3 업로드를 쓰려면 아래도 설정
# export POLLY_S3_BUCKET=your-bucket
# export POLLY_S3_PREFIX=polly-lab/

node index.js
```

### 테스트(curl)
```
apt  install jq  # version 1.7.1-3ubuntu0.24.04.1
```
---
```bash
curl -s http://localhost:3001/tts \
  -H 'Content-Type: application/json' \
  -d '{"text":"안녕하세요. 폴리 실습입니다.","voiceId":"Seoyeon","format":"mp3"}' \
| jq -r '.audioBase64' \
| base64 -d > out.mp3

```
---



### Postman
`postman/` 폴더의 컬렉션/환경파일을 import 후 실행하세요.

## 주요 엔드포인트
- `POST /tts` : 텍스트/SSML → 오디오(Base64) 또는 S3 URL
- `POST /marks` : 텍스트/SSML → speech marks(JSON Lines)
- `GET /voices` : 사용 가능한 보이스(간단 캐시)
- `GET /health`

자세한 내용은 `docs/api.md` 참고.
