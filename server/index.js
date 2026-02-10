const express = require("express");
const cors = require("cors");
const { listVoices, synthesize, speechMarks } = require("./pollyClient");
const { hasS3Config, uploadAudio, presignGet } = require("./s3Client");

const app = express();
app.use(cors()); // ✅ 브라우저 FE에서 호출 가능
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/voices", async (req, res) => {
  try {
    const languageCode = req.query.languageCode || "ko-KR";
    const voices = await listVoices({ languageCode });
    res.json({ languageCode, count: voices.length, voices });
  } catch (e) {
    res.status(500).json({ error: e.message || "unknown error" });
  }
});

/**
 * POST /tts
 * body:
 *  - text (required)
 *  - textType: "text" | "ssml" (default text)
 *  - voiceId: default Seoyeon
 *  - engine: "standard" | "neural" (계정/리전/보이스에 따라 다름)
 *  - format: "mp3" | "ogg_vorbis" | "pcm" (default mp3)
 *  - sampleRate: only for pcm
 *  - saveToS3: boolean (default false)
 */
app.post("/tts", async (req, res) => {
  try {
    const {
      text,
      textType = "text",
      voiceId = "Seoyeon",
      engine = "standard",
      format = "mp3",
      sampleRate = "22050",
      saveToS3 = false
    } = req.body || {};

    if (!text || !String(text).trim()) return res.status(400).json({ error: "text가 필요합니다." });

    const { buffer, contentType } = await synthesize({
      text,
      textType,
      voiceId,
      outputFormat: format,
      engine,
      sampleRate
    });

    // 옵션: S3 저장 + presigned URL 제공
    if (saveToS3) {
      if (!hasS3Config()) return res.status(400).json({ error: "S3 저장을 쓰려면 POLLY_S3_BUCKET 환경변수가 필요합니다." });

      const prefix = process.env.POLLY_S3_PREFIX || "polly-lab/";
      const ext = format === "mp3" ? "mp3" : (format === "ogg_vorbis" ? "ogg" : "pcm");
      const key = `${prefix}${Date.now()}-${voiceId}.${ext}`;

      await uploadAudio({ key, buffer, contentType });
      const url = await presignGet({ key, expiresIn: 3600 });

      return res.json({ savedToS3: true, s3Key: key, presignedUrl: url, contentType });
    }

    // 기본: Base64 반환
    const audioBase64 = buffer.toString("base64");
    res.json({ savedToS3: false, contentType, audioBase64 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "unknown error" });
  }
});

/**
 * POST /marks
 * body:
 *  - text (required)
 *  - textType: text|ssml
 *  - voiceId
 *  - engine
 *  - marks: ["word","sentence","viseme","ssml"]
 */
app.post("/marks", async (req, res) => {
  try {
    const {
      text,
      textType = "text",
      voiceId = "Seoyeon",
      engine = "standard",
      marks = ["word","sentence"]
    } = req.body || {};

    if (!text || !String(text).trim()) return res.status(400).json({ error: "text가 필요합니다." });

    const jsonLines = await speechMarks({ text, textType, voiceId, marks, engine });
    res.json({ voiceId, marks, jsonLines });
  } catch (e) {
    res.status(500).json({ error: e.message || "unknown error" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`polly-lab server listening on :${port}`));
