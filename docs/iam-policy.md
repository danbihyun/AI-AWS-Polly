# IAM 정책 예시(최소 권한)

## 1) Polly 호출 최소
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "polly:SynthesizeSpeech",
        "polly:DescribeVoices"
      ],
      "Resource": "*"
    }
  ]
}
```

## 2) S3 저장(옵션)
버킷 단위로 제한 권장:
```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject","s3:GetObject"],
  "Resource": ["arn:aws:s3:::YOUR_BUCKET_NAME/polly-lab/*"]
}
```
