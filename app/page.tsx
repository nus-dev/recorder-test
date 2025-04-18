"use client";

import { Dispatch, SetStateAction, useState } from "react";

export default function Home() {
  const [volumes, setVolumes] = useState<number[]>([]);
  return (
    <div>
      <button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          console.log("Record Start");
          recordStart(setVolumes);
        }}
      >
        Record Start
      </button>
      <div>
        {volumes.map((volume, index) => (
          <div key={index}>{volume}</div>
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
