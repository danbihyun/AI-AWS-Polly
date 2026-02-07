# Chapter 03. 기존 Express 서버 구조 이해

## 학습 목표
- 기존 `server/index.js` 엔드포인트 설계를 해석한다.
- `POST /tts`, `POST /marks`, `GET /voices` 역할을 구분한다.

## 엔드포인트 설계
- `/tts`: 텍스트를 음성으로 변환 후 Base64 또는 S3 URL 반환.
- `/marks`: 단어/문장 타이밍 정보(JSON Lines) 반환.
- `/voices`: 특정 언어 보이스 목록 제공.

## 예외 처리 전략
- 입력 텍스트 누락 시 400.
- AWS SDK 에러는 500 + 메시지 반환.
- S3 저장 활성화 시 버킷 환경변수 유효성 검사.

## 실습 과제
- `voiceId`를 바꾸며 발화 차이 청취.
- `ssml` 입력으로 발음/속도/휴지 제어 테스트.
