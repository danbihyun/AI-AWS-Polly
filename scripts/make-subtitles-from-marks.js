#!/usr/bin/env node
/**
 * Convert Polly Speech Marks (JSON lines) → WebVTT subtitles (rough)
 *
 * Steps:
 * 1) Call POST /marks to get jsonLines (word/sentence)
 * 2) Save to a file, then:
 *    node scripts/make-subtitles-from-marks.js --in marks.jsonl --out captions.vtt --mode sentence
 */
const fs = require("fs");

function arg(name, def = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return def;
  return process.argv[idx + 1] ?? def;
}

function msToTimestamp(ms) {
  const s = Math.floor(ms / 1000);
  const milli = ms % 1000;
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}.${String(milli).padStart(3, "0")}`;
}

(async () => {
  const input = arg("in");
  const output = arg("out", "captions.vtt");
  const mode = arg("mode", "sentence"); // sentence|word

  if (!input) throw new Error("--in marks.jsonl 필요");

  const lines = fs.readFileSync(input, "utf-8").split(/\r?\n/).filter(Boolean);
  const marks = lines.map(l => JSON.parse(l)).filter(m => m.type === mode);

  let vtt = "WEBVTT\n\n";
  for (let i = 0; i < marks.length; i++) {
    const cur = marks[i];
    const next = marks[i + 1];
    const start = cur.time;
    const end = next ? next.time : (cur.time + 1500);
    vtt += `${i + 1}\n`;
    vtt += `${msToTimestamp(start)} --> ${msToTimestamp(end)}\n`;
    vtt += `${cur.value}\n\n`;
  }

  fs.writeFileSync(output, vtt);
  console.log(`Wrote: ${output} (${marks.length} cues)`);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
