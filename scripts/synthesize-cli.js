#!/usr/bin/env node
/**
 * Polly synthesize CLI
 *
 * Usage:
 *  node scripts/synthesize-cli.js --text "안녕하세요" --voice Seoyeon --format mp3 --out ./out.mp3
 *  node scripts/synthesize-cli.js --ssml "<speak>안녕하세요</speak>" --voice Seoyeon --format mp3 --out ./out.mp3
 */
const fs = require("fs");
const path = require("path");
const { synthesize } = require("../server/pollyClient");

function arg(name, def = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return def;
  return process.argv[idx + 1] ?? def;
}

(async () => {
  const text = arg("text");
  const ssml = arg("ssml");
  const out = arg("out", "./polly-output.mp3");
  const voiceId = arg("voice", "Seoyeon");
  const format = arg("format", "mp3");
  const engine = arg("engine", "standard");

  if (!process.env.AWS_REGION) throw new Error("AWS_REGION env required");
  if (!text && !ssml) throw new Error("--text 또는 --ssml 중 하나가 필요합니다.");

  const textType = ssml ? "ssml" : "text";
  const input = ssml || text;

  const { buffer } = await synthesize({ text: input, textType, voiceId, outputFormat: format, engine });

  fs.writeFileSync(out, buffer);
  console.log(`Wrote: ${path.resolve(out)} (${buffer.length} bytes)`);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
