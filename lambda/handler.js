const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const region = process.env.AWS_REGION;
const bucket = process.env.POLLY_S3_BUCKET;
const prefix = process.env.POLLY_S3_PREFIX || "polly-lab/";

// ❌ allowOrigin / CORS_ALLOW_ORIGIN 사용 제거
// const allowOrigin = process.env.CORS_ALLOW_ORIGIN || "*";

const polly = new PollyClient({ region });
const s3 = new S3Client({ region });

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
      // ❌ CORS 헤더는 Function URL CORS가 붙여줌 (중복 방지)
      // "Access-Control-Allow-Origin": allowOrigin,
      // "Access-Control-Allow-Methods": "POST,OPTIONS",
      // "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(payload)
  };
}

exports.handler = async (event) => {
  // ❌ OPTIONS는 Function URL CORS가 처리하므로 제거(남겨도 되지만 헤더 중복 위험)
  // if (event.requestContext?.http?.method === "OPTIONS") {
  //   return json(200, { ok: true });
  // }

  if (!region || !bucket) {
    return json(500, { error: "AWS_REGION 및 POLLY_S3_BUCKET 환경변수가 필요합니다." });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const {
      text,
      textType = "text",
      voiceId = "Seoyeon",
      engine = "standard",
      format = "mp3"
    } = body;

    if (!text || !String(text).trim()) {
      return json(400, { error: "text가 필요합니다." });
    }

    const pollyRes = await polly.send(new SynthesizeSpeechCommand({
      Text: text,
      TextType: textType,
      VoiceId: voiceId,
      OutputFormat: format,
      Engine: engine
    }));

    const chunks = [];
    for await (const chunk of pollyRes.AudioStream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const ext = format === "ogg_vorbis" ? "ogg" : format;
    const safeVoice = String(voiceId).replace(/[^a-zA-Z0-9_-]/g, "");
    const key = `${prefix}${Date.now()}-${safeVoice}.${ext}`;
    const contentType =
      format === "mp3" ? "audio/mpeg" :
      format === "ogg_vorbis" ? "audio/ogg" :
      "application/octet-stream";

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    }));

    const audioUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 3600 }
    );

    return json(200, {
      savedToS3: true,
      s3Bucket: bucket,
      s3Key: key,
      contentType,
      audioUrl,
      expiresIn: 3600
    });
  } catch (error) {
    console.error(error);
    return json(500, { error: error.message || "unknown error" });
  }
};
