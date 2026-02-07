# Chapter 02. AWS Polly 기초와 Node SDK v3

## 학습 목표
- `@aws-sdk/client-polly`의 주요 명령을 사용할 수 있다.
- `SynthesizeSpeech`와 `DescribeVoices`의 입력/출력 구조를 이해한다.

## 주요 API
- `DescribeVoicesCommand`: 언어 코드별 사용 가능한 Voice 조회.
- `SynthesizeSpeechCommand`: 텍스트/SSML을 오디오 스트림으로 변환.

## 구현 포인트
- `TextType`: `text` 또는 `ssml`.
- `OutputFormat`: `mp3`, `ogg_vorbis`, `pcm`, `json(speech marks)`.
- `Engine`: `standard`/`neural` (리전/보이스 지원 여부 체크 필요).

## 스트림 처리
Polly 응답의 `AudioStream`은 Node 환경에서 비동기 iterable로 읽어 `Buffer.concat`으로 결합한다.
이 버퍼는 파일 저장, S3 업로드, Base64 변환 등으로 활용할 수 있다.
