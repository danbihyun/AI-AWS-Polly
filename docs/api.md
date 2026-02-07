# API 사용법

## POST /tts
입력:
```json
{
  "text": "안녕하세요. 폴리 실습입니다.",
  "textType": "text",
  "voiceId": "Seoyeon",
  "engine": "standard",
  "format": "mp3",
  "saveToS3": false
}
```

- `textType`: `"text"` 또는 `"ssml"`
- `format`: `"mp3" | "ogg_vorbis" | "pcm"`
- `engine`: `"standard" | "neural"` (계정/리전/보이스 지원 여부에 따라 다름)
- `saveToS3=true`이면:
  - env `POLLY_S3_BUCKET`, (선택) `POLLY_S3_PREFIX` 필요
  - 응답에 `presignedUrl` 포함

응답(기본):
```json
{ "savedToS3": false, "contentType": "audio/mpeg", "audioBase64": "..." }
```

## POST /marks
입력:
```json
{
  "text": "안녕하세요. 자막 타이밍을 뽑습니다.",
  "marks": ["word","sentence"],
  "voiceId": "Seoyeon",
  "textType": "text"
}
```

응답:
- `jsonLines`: JSON Lines 문자열(각 줄이 하나의 mark)

## GET /voices
- `?languageCode=ko-KR` (기본 ko-KR)
