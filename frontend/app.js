const el = {
  apiUrl: document.getElementById("apiUrl"),
  text: document.getElementById("text"),
  voiceId: document.getElementById("voiceId"),
  engine: document.getElementById("engine"),
  button: document.getElementById("synthesizeBtn"),
  status: document.getElementById("status"),
  player: document.getElementById("player")
};

const cacheKey = "polly-lambda-url";
el.apiUrl.value = localStorage.getItem(cacheKey) || "";

function setStatus(message, isError = false) {
  el.status.textContent = message;
  el.status.style.color = isError ? "#b91c1c" : "#1f2937";
}

async function synthesize() {
  const apiUrl = el.apiUrl.value.trim();
  const text = el.text.value.trim();
  if (!apiUrl) return setStatus("Lambda Function URL을 입력하세요.", true);
  if (!text) return setStatus("텍스트를 입력하세요.", true);

  localStorage.setItem(cacheKey, apiUrl);
  el.button.disabled = true;
  setStatus("음성 생성 중...");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        textType: "text",
        voiceId: el.voiceId.value,
        engine: el.engine.value,
        format: "mp3"
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "요청 실패");

    el.player.src = data.audioUrl;
    await el.player.play();
    setStatus(`완료: ${data.s3Key}\n재생 URL 만료(초): ${data.expiresIn}`);
  } catch (error) {
    setStatus(`오류: ${error.message}`, true);
  } finally {
    el.button.disabled = false;
  }
}

el.button.addEventListener("click", synthesize);
