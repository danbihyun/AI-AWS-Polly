#!/usr/bin/env bash
set -euo pipefail

# 사용 예시
# AWS_REGION=ap-northeast-2 \
# LAMBDA_NAME=polly-tts-lambda \
# ROLE_NAME=polly-tts-lambda-role \
# POLLY_S3_BUCKET=my-polly-bucket \
# CORS_ALLOW_ORIGIN='*' \
# ./infra/aws-cli-deploy-lambda.sh

: "${AWS_REGION:?AWS_REGION is required}"
: "${LAMBDA_NAME:?LAMBDA_NAME is required}"
: "${ROLE_NAME:?ROLE_NAME is required}"
: "${POLLY_S3_BUCKET:?POLLY_S3_BUCKET is required}"

RUNTIME=nodejs20.x
HANDLER=handler.handler
ZIP_FILE=lambda.zip

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo "[1/7] Lambda dependency install"
pushd lambda >/dev/null
npm install --omit=dev
zip -rq "../${ZIP_FILE}" .
popd >/dev/null

echo "[2/7] IAM role create (if not exists)"
if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]
  }' >/dev/null
fi

echo "[3/7] Attach policies"
aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole >/dev/null || true

cat > /tmp/polly-inline-policy.json <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {"Effect": "Allow", "Action": ["polly:SynthesizeSpeech"], "Resource": "*"},
    {"Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject"], "Resource": "arn:aws:s3:::${POLLY_S3_BUCKET}/*"}
  ]
}
POLICY
aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name PollyS3Access --policy-document file:///tmp/polly-inline-policy.json

echo "[4/7] Lambda create/update"
if aws lambda get-function --function-name "$LAMBDA_NAME" >/dev/null 2>&1; then
  aws lambda update-function-code --function-name "$LAMBDA_NAME" --zip-file "fileb://${ZIP_FILE}" >/dev/null
  aws lambda update-function-configuration \
    --function-name "$LAMBDA_NAME" \
    --runtime "$RUNTIME" \
    --handler "$HANDLER" \
    --environment "Variables={AWS_REGION=${AWS_REGION},POLLY_S3_BUCKET=${POLLY_S3_BUCKET},POLLY_S3_PREFIX=polly-lab/,CORS_ALLOW_ORIGIN=${CORS_ALLOW_ORIGIN:-*}}" >/dev/null
else
  aws lambda create-function \
    --function-name "$LAMBDA_NAME" \
    --runtime "$RUNTIME" \
    --handler "$HANDLER" \
    --role "$ROLE_ARN" \
    --zip-file "fileb://${ZIP_FILE}" \
    --timeout 15 \
    --memory-size 256 \
    --environment "Variables={AWS_REGION=${AWS_REGION},POLLY_S3_BUCKET=${POLLY_S3_BUCKET},POLLY_S3_PREFIX=polly-lab/,CORS_ALLOW_ORIGIN=${CORS_ALLOW_ORIGIN:-*}}" >/dev/null
fi

echo "[5/7] Wait for function active"
aws lambda wait function-active-v2 --function-name "$LAMBDA_NAME"

echo "[6/7] Function URL create/get"
if ! aws lambda get-function-url-config --function-name "$LAMBDA_NAME" >/dev/null 2>&1; then
  aws lambda create-function-url-config --function-name "$LAMBDA_NAME" --auth-type NONE >/dev/null
fi
aws lambda add-permission \
  --function-name "$LAMBDA_NAME" \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE >/dev/null 2>&1 || true

FUNCTION_URL=$(aws lambda get-function-url-config --function-name "$LAMBDA_NAME" --query FunctionUrl --output text)

echo "[7/7] S3 bucket CORS"
cat > /tmp/polly-cors.json <<CORS
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
CORS
aws s3api put-bucket-cors --bucket "$POLLY_S3_BUCKET" --cors-configuration file:///tmp/polly-cors.json

rm -f "$ZIP_FILE"

echo "완료: Function URL"
echo "$FUNCTION_URL"
