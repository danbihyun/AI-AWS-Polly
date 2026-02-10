const { S3Client, DeleteObjectCommand, GetObjectTaggingCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  const bucket = event.bucket;
  const key = event.key;

  // 안전장치: prefix 제한
  if (!key || !key.startsWith(process.env.PREFIX || "polly-lab/")) {
    return { skipped: true, reason: "not target prefix", key };
  }

  // (선택) 태그 검증: ttl=10m 인 경우만 삭제하고 싶으면 ENABLE_TAG_CHECK=true로
  if (process.env.ENABLE_TAG_CHECK === "true") {
    const tagRes = await s3.send(new GetObjectTaggingCommand({ Bucket: bucket, Key: key }));
    const tags = Object.fromEntries((tagRes.TagSet || []).map(t => [t.Key, t.Value]));
    if (tags.ttl !== "10m") {
      return { skipped: true, reason: "ttl tag mismatch", tags };
    }
  }

  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  return { deleted: true, bucket, key };
};
