# Chapter 05. Lambda 기반 API로 전환

## 학습 목표
- Express 의존 없이 Lambda 핸들러 기반 TTS API를 작성한다.
- Function URL 이벤트 포맷으로 요청/응답을 처리한다.

## 설계 포인트
- `handler(event)`에서 `event.body` JSON 파싱.
- CORS 헤더 포함(`Access-Control-Allow-Origin`).
- 성공 시 `audioUrl`, `s3Key` 반환.

## 장점
- 서버 관리가 필요 없는 서버리스 배포.
- 트래픽 급증 시 자동 확장.
- 사용량 기반 과금.

## 주의사항
- Cold Start를 줄이기 위해 의존성 최소화.
- 동일 리전에 Polly/S3/Lambda 배치.
