# Chapter 06. AWS CLI로 인프라 배포

## 학습 목표
- AWS CLI로 IAM Role, Lambda, Function URL, S3 CORS를 구성한다.
- 반복 가능한 배포 스크립트 구조를 이해한다.

## 배포 순서
1. IAM 실행 역할 생성 및 정책 연결.
2. Lambda 코드 zip 패키징.
3. `create-function` 또는 `update-function-code` 실행.
4. Function URL 생성 및 공개 권한 설정.
5. S3 CORS 설정(브라우저 오디오 재생/요청 허용).

## 자동화 포인트
- 모든 설정값을 환경변수화.
- 스크립트를 idempotent하게 작성(이미 있으면 업데이트).
