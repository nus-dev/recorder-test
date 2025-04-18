"use client";

import { Dispatch, SetStateAction, useState } from "react";

export default function Home() {
  const [volumes, setVolumes] = useState<number[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  return (
    <div>
      <button
        style={{
          backgroundColor: "blue",
          color: "white",
          padding: "14px",
          borderRadius: "4px",
        }}
        onClick={async () => {
          console.log("Record Start");
          try {
            await recordStart(setVolumes);
          } catch (error) {
            setErrors((prev) => [...prev, `${error}`]);
          }
        }}
      >
        Record Start
      </button>
      <div style={{ display: "flex", gap: "4px" }}>
        {volumes.map((volume, index) => (
          <div key={index}>{volume}</div>
        ))}
      </div>
      <div>
        {errors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </div>
    </div>
  );
}

async function recordStart(setVolumes: Dispatch<SetStateAction<number[]>>) {
  // 권한 받기
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true,
    systemAudio: "include",
  } as MediaStreamConstraints);

  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    alert("No audio tracks found");
    stream.getTracks().forEach((track) => track.stop());
    return;
  }

  const mediaRecorder = new MediaRecorder(stream);
  const audioContext = new AudioContext();

  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // 볼륨 측정을 위한 인터벌 설정
  setInterval(() => {
    analyser.getByteFrequencyData(dataArray);
    const averageVolume = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    setVolumes((prev) => [...prev, averageVolume]);
  }, 100);

  mediaRecorder.start(1 * 1000);
}
