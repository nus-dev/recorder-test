"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [volumes, setVolumes] = useState<number[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const chartData = volumes.map((volume, index) => ({
    time: index,
    volume: volume
  }));

  return (
    <div style={{ padding: "20px" }}>
      <button
        style={{
          backgroundColor: "blue",
          color: "white",
          padding: "14px",
          borderRadius: "4px",
          marginBottom: "20px"
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

      <div style={{ height: "400px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="volume" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        {errors.map((error, index) => (
          <div key={index} style={{ color: "red" }}>{error}</div>
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
