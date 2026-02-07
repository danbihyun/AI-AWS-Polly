# Chapter 01. 프로젝트 개요와 목표

## 학습 목표
- Amazon Polly 기반 TTS(Text-to-Speech) 시스템의 전체 아키텍처를 이해한다.
- 기존 Express API 구조와 Lambda + Frontend 확장 구조를 비교한다.
- 데이터 흐름(텍스트 입력 → 음성 합성 → S3 저장 → 재생 URL 전달)을 설명할 수 있다.

## 핵심 개념
- **TTS 파이프라인**: 입력 텍스트를 음성 바이트 스트림(MP3)으로 변환.
- **저장 전략**: Base64 즉시 반환 vs S3 저장 후 URL 반환.
- **런타임 선택**: 로컬 서버(Express)와 서버리스(Lambda)의 운영 관점 차이.

## 아키텍처 흐름
1. 사용자가 FE에서 텍스트를 입력한다.
2. FE가 Lambda Function URL로 POST 요청을 보낸다.
3. Lambda가 Polly로 MP3를 생성한다.
4. Lambda가 MP3를 S3에 업로드한다.
5. Lambda가 재생 가능한 presigned URL을 반환한다.
6. FE `<audio>` 플레이어가 URL을 재생한다.

## 실습 포인트
- 환경변수(`AWS_REGION`, `POLLY_S3_BUCKET`) 의미 이해.
- 음성 옵션(`voiceId`, `engine`)이 결과에 미치는 영향 확인.
