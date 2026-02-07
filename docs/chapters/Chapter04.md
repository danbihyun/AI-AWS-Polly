# Chapter 04. S3 저장과 Presigned URL

## 학습 목표
- `@aws-sdk/client-s3`로 오디오 업로드를 구현한다.
- `@aws-sdk/s3-request-presigner`로 임시 재생 URL을 생성한다.

## 핵심 구성
- `PutObjectCommand`: MP3 바이트를 버킷/키에 저장.
- `GetObjectCommand` + `getSignedUrl`: 만료시간이 있는 접근 URL 생성.

## 보안 관점
- 버킷은 비공개 유지, presigned URL만 배포.
- URL 만료 시간을 짧게 설정(예: 10~60분).
- Lambda 실행 역할에 최소 권한(`s3:PutObject`, `s3:GetObject`) 부여.

## 운영 팁
- Prefix로 오브젝트를 분리(예: `polly-lab/`).
- 수명주기(Lifecycle) 정책으로 저장 비용 관리.
