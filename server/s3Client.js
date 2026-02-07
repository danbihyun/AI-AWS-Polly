const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

function hasS3Config() {
  return !!process.env.POLLY_S3_BUCKET;
}

const s3 = new S3Client({ region: process.env.AWS_REGION });

async function uploadAudio({ key, buffer, contentType }) {
  const bucket = process.env.POLLY_S3_BUCKET;
  if (!bucket) throw new Error("POLLY_S3_BUCKET 환경변수가 필요합니다.");
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }));
  return { bucket, key };
}

async function presignGet({ key, expiresIn = 3600 }) {
  const bucket = process.env.POLLY_S3_BUCKET;
  if (!bucket) throw new Error("POLLY_S3_BUCKET 환경변수가 필요합니다.");
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return url;
}

module.exports = { hasS3Config, uploadAudio, presignGet };
