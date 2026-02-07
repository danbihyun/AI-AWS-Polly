# SSML 스니펫 모음

## 1) 쉬는 구간
```xml
<speak>
  안녕하세요 <break time="600ms"/> 폴리입니다.
</speak>
```

## 2) 속도/톤/볼륨
```xml
<speak>
  <prosody rate="90%" pitch="+2st" volume="-2dB">조금 더 차분하게 말해요.</prosody>
</speak>
```

## 3) 숫자 읽기
```xml
<speak>
  <say-as interpret-as="digits">01012345678</say-as>
</speak>
```

## 4) 발음 교정(phoneme)
> phoneme은 IPA 또는 X-SAMPA를 사용할 수 있습니다(환경/보이스에 따라).
```xml
<speak>
  <phoneme alphabet="ipa" ph="se.jʌn">서연</phoneme>
</speak>
```
