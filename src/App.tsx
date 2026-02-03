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

  const [leftVib, setLeftVib] = useState(1);
  const [rightVib, setRightVib] = useState(1);

  const [speed, setSpeed] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [wallOn, setWallOn] = useState(false);
  const [wallType, setWallType] = useState<"fixed" | "free">("fixed");

  const [paused, setPaused] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Wave Simulator</h1>
        <p className="app-subtitle">波の干渉・反射・定常波を可視化</p>
      </header>

      <div className="toolbar">
        <button
          className={`toolbar-btn ${wallOn ? "active" : ""}`}
          onClick={() => setWallOn((v) => !v)}
        >
          {wallOn ? "壁 ON" : "壁"}
        </button>
        {wallOn && (
          <>
            <button
              className={`toolbar-btn ${wallType === "fixed" ? "active" : ""}`}
              onClick={() => setWallType("fixed")}
            >
              固定端
            </button>
            <button
              className={`toolbar-btn ${wallType === "free" ? "active" : ""}`}
              onClick={() => setWallType("free")}
            >
              自由端
            </button>
          </>
        )}
        <button
          className={`toolbar-btn primary ${paused ? "" : "active"}`}
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? "▶ 再生" : "⏸ 停止"}
        </button>
      </div>

      <div className="canvas-wrap">
        <WaveCanvas
          leftOn={leftOn}
          rightOn={rightOn}
          leftAmp={leftAmp}
          rightAmp={rightAmp}
          leftLambda={leftLambda}
          rightLambda={rightLambda}
          leftVib={leftVib}
          rightVib={rightVib}
          speed={speed}
          playbackSpeed={playbackSpeed}
          wallOn={wallOn}
          wallType={wallType}
          paused={paused}
        />
      </div>

      <div className="legend">
        <span className="legend-item">
          <span className="legend-dot green" /> 左からの波（入射）
        </span>
        <span className="legend-item">
          <span className="legend-dot red" /> 右からの波（入射）
        </span>
        <span className="legend-item">
          <span className="legend-dot blue" /> 定常波
        </span>
        <span className="legend-item">
          <span className="legend-dot orange" /> 反射波（壁あり時）
        </span>
      </div>

      <div className="controls">
        <section className="controls-section global">
          <h2>全体</h2>
          <div className="control-row">
            <label>
              <span className="control-label">
                波の速度倍率 <span className="control-value">{speed < 1 ? speed.toFixed(2) : speed.toFixed(1)}</span>
              </span>
              <input
                type="range"
                min={0.01}
                max={2}
                step={0.01}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="control-row">
            <label>
              <span className="control-label">
                表示速度 <span className="control-value">{playbackSpeed < 1 ? playbackSpeed.toFixed(2) : playbackSpeed.toFixed(1)}×</span>
              </span>
              <input
                type="range"
                min={0.1}
                max={2}
                step={0.1}
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              />
            </label>
          </div>
        </section>

        <section className="controls-section left">
          <h2>左端</h2>
          <div className="toggle-wrap">
            <button
              className={`toggle-btn ${leftOn ? "on" : "off"}`}
              onClick={() => setLeftOn((v) => !v)}
            >
              {leftOn ? "ON" : "OFF"}
            </button>
          </div>
          <div className="control-row">
            <label>
              <span className="control-label">振幅 A = <span className="control-value">{leftAmp}</span></span>
              <input
                type="range"
                min={10}
                max={80}
                value={leftAmp}
                onChange={(e) => setLeftAmp(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="control-row">
            <label>
              <span className="control-label">波長 λ = <span className="control-value">{leftLambda}</span></span>
              <input
                type="range"
                min={80}
                max={400}
                value={leftLambda}
                onChange={(e) => setLeftLambda(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="control-row">
            <label>
              <span className="control-label">振動数 f = <span className="control-value">{leftVib.toFixed(1)} Hz</span></span>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={leftVib}
                onChange={(e) => setLeftVib(Number(e.target.value))}
              />
            </label>
          </div>
        </section>

        <section className="controls-section right">
          <h2>右端</h2>
          <div className="toggle-wrap">
            <button
              className={`toggle-btn ${rightOn ? "on" : "off"}`}
              onClick={() => setRightOn((v) => !v)}
            >
              {rightOn ? "ON" : "OFF"}
            </button>
          </div>
          <div className="control-row">
            <label>
              <span className="control-label">振幅 A = <span className="control-value">{rightAmp}</span></span>
              <input
                type="range"
                min={10}
                max={80}
                value={rightAmp}
                onChange={(e) => setRightAmp(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="control-row">
            <label>
              <span className="control-label">波長 λ = <span className="control-value">{rightLambda}</span></span>
              <input
                type="range"
                min={80}
                max={400}
                value={rightLambda}
                onChange={(e) => setRightLambda(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="control-row">
            <label>
              <span className="control-label">振動数 f = <span className="control-value">{rightVib.toFixed(1)} Hz</span></span>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={rightVib}
                onChange={(e) => setRightVib(Number(e.target.value))}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
