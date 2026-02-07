const { PollyClient, SynthesizeSpeechCommand, DescribeVoicesCommand } = require("@aws-sdk/client-polly");

function requireEnv(name, fallback = null) {
  const v = process.env[name] ?? fallback;
  if (v === null || v === undefined || v === "") throw new Error(`${name} 환경변수가 필요합니다.`);
  return v;
}

const client = new PollyClient({ region: requireEnv("AWS_REGION") });

// 간단 캐시(프로세스 메모리)
let voiceCache = { ts: 0, data: null };

async function listVoices({ languageCode = "ko-KR" } = {}) {
  const now = Date.now();
  if (voiceCache.data && (now - voiceCache.ts) < 10 * 60 * 1000) return voiceCache.data; // 10분 캐시

  const res = await client.send(new DescribeVoicesCommand({ LanguageCode: languageCode }));
  voiceCache = { ts: now, data: res.Voices || [] };
  return voiceCache.data;
}

async function synthesize({ text, textType = "text", voiceId = "Seoyeon", outputFormat = "mp3", engine = "standard", sampleRate = "22050" }) {
  // outputFormat: mp3 | ogg_vorbis | pcm
  // textType: text | ssml
  const cmd = new SynthesizeSpeechCommand({
    Text: text,
    TextType: textType,
    VoiceId: voiceId,
    OutputFormat: outputFormat,
    Engine: engine,
    SampleRate: outputFormat === "pcm" ? sampleRate : undefined
  });

  const res = await client.send(cmd);
  // AudioStream is a Readable stream in Node
  const chunks = [];
  for await (const chunk of res.AudioStream) chunks.push(chunk);
  const buf = Buffer.concat(chunks);
  return { buffer: buf, contentType: outputFormat === "mp3" ? "audio/mpeg" : (outputFormat === "ogg_vorbis" ? "audio/ogg" : "audio/pcm") };
}

async function speechMarks({ text, textType = "text", voiceId = "Seoyeon", marks = ["word","sentence"], engine = "standard" }) {
  const cmd = new SynthesizeSpeechCommand({
    Text: text,
    TextType: textType,
    VoiceId: voiceId,
    OutputFormat: "json",
    SpeechMarkTypes: marks,
    Engine: engine
  });

  const res = await client.send(cmd);
  const chunks = [];
  for await (const chunk of res.AudioStream) chunks.push(chunk);
  const buf = Buffer.concat(chunks);
  // JSON lines
  return buf.toString("utf-8");
}

module.exports = { listVoices, synthesize, speechMarks };
