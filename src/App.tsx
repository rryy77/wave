import { useState } from "react";
import WaveCanvas from "./WaveCanvas";
import "./App.css";

export default function App() {
  const [leftOn, setLeftOn] = useState(true);
  const [rightOn, setRightOn] = useState(true);

  const [leftAmp, setLeftAmp] = useState(40);
  const [rightAmp, setRightAmp] = useState(40);

  const [leftLambda, setLeftLambda] = useState(200);
  const [rightLambda, setRightLambda] = useState(200);

  const [leftFreq, setLeftFreq] = useState(1);
  const [rightFreq, setRightFreq] = useState(1);

  const [speed, setSpeed] = useState(1);

  return (
    <div className="app">
      <h1>Wave Simulator</h1>

      <WaveCanvas
        leftOn={leftOn}
        rightOn={rightOn}
        leftAmp={leftAmp}
        rightAmp={rightAmp}
        leftLambda={leftLambda}
        rightLambda={rightLambda}
        leftFreq={leftFreq}
        rightFreq={rightFreq}
        speed={speed}
      />

      <div className="controls">
        <label>
          波の速度倍率 = {speed.toFixed(1)}
          <input
            type="range"
            min={0.2}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>

        <hr />

        <h2>左端（緑）</h2>
        <button onClick={() => setLeftOn((v) => !v)}>
          {leftOn ? "OFF" : "ON"}
        </button>

        <label>
          振幅 A = {leftAmp}
          <input
            type="range"
            min={10}
            max={80}
            value={leftAmp}
            onChange={(e) => setLeftAmp(Number(e.target.value))}
          />
        </label>

        <label>
          波長 λ = {leftLambda}
          <input
            type="range"
            min={80}
            max={400}
            value={leftLambda}
            onChange={(e) => setLeftLambda(Number(e.target.value))}
          />
        </label>

        <label>
          周波数 f = {leftFreq.toFixed(1)} Hz
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={leftFreq}
            onChange={(e) => setLeftFreq(Number(e.target.value))}
          />
        </label>

        <hr />

        <h2>右端（赤）</h2>
        <button onClick={() => setRightOn((v) => !v)}>
          {rightOn ? "OFF" : "ON"}
        </button>

        <label>
          振幅 A = {rightAmp}
          <input
            type="range"
            min={10}
            max={80}
            value={rightAmp}
            onChange={(e) => setRightAmp(Number(e.target.value))}
          />
        </label>

        <label>
          波長 λ = {rightLambda}
          <input
            type="range"
            min={80}
            max={400}
            value={rightLambda}
            onChange={(e) => setRightLambda(Number(e.target.value))}
          />
        </label>

        <label>
          周波数 f = {rightFreq.toFixed(1)} Hz
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={rightFreq}
            onChange={(e) => setRightFreq(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
