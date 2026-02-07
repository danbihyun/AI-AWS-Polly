# Amazon Polly 응용 실습 커리큘럼 (Node.js)

## 목표
- Polly로 텍스트/SSML을 음성으로 변환하고(mp3/ogg/pcm)
- Speech Marks로 **자막 타이밍/워드 타이밍**을 뽑고
- (옵션) S3에 저장해 **Presigned URL**로 배포하는 API를 만든다.

## 1회차: Polly 기본 호출
- DescribeVoices로 Voice 리스트 확인
- SynthesizeSpeech로 MP3 생성

## 2회차: SSML 적용
- `<speak>`, `<break>`, `<prosody>`, `<say-as>`, `<phoneme>` 사용
- 텍스트/SSML 입력 분기(textType)

## 3회차: Speech Marks
- word/sentence marks 생성(JSON lines)
- 간단 VTT 자막 생성 스크립트 작성

## 4회차: API 서버화
- Express로 `/tts`, `/marks`, `/voices` 구현
- Base64 반환 vs 파일 저장 전략

## 5회차: S3 업로드/배포(옵션)
- S3 PutObject + Presigned GET URL
- 캐싱, TTL, 키 네이밍 규칙

## 6회차: 캡스톤
- “공지/안내 음성 생성기”
  - 입력: 안내문(SSML 포함 가능)
  - 출력: 오디오(mp3) + 자막(vtt) + 공유 URL
