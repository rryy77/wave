// WaveCanvas.tsx（もっと前のやつ：壁ボタン入れた直後・ストップ無し）

import { useRef, useEffect } from "react";

type WaveCanvasProps = {
  leftOn: boolean;
  rightOn: boolean;

  leftAmp: number;
  rightAmp: number;

  leftLambda: number;
  rightLambda: number;

  leftFreq: number;
  rightFreq: number;

  speed: number;

  wallOn: boolean;
  wallType: "fixed" | "free";

  paused: boolean;
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const smoothstep = (x: number) => x * x * (3 - 2 * x);

export default function WaveCanvas({
  leftOn,
  rightOn,
  leftAmp,
  rightAmp,
  leftLambda,
  rightLambda,
  leftFreq,
  rightFreq,
  speed,
  wallOn,
  wallType,
  paused,
}: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tRef = useRef(0);
  const startedRef = useRef(false);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    if (!startedRef.current && (leftOn || rightOn)) {
      tRef.current = 0;
      startedRef.current = true;
    }

    if (!leftOn && !rightOn) {
      startedRef.current = false;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 400;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawLine = (
      getY: (x: number) => number,
      color: string,
      width: number,
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 - getY(x);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const draw = () => {
      const t = tRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const L = canvas.width;
      const mid = L / 2;

      const vL = leftLambda * leftFreq * speed;
      const vR = rightLambda * rightFreq * speed;

      const kL = (2 * Math.PI) / leftLambda;
      const kR = (2 * Math.PI) / rightLambda;
      const wL = 2 * Math.PI * leftFreq;
      const wR = 2 * Math.PI * rightFreq;

      const smooth = 60;

      // ========= 通常（元のやつ） =========
      if (!wallOn) {
        // 定常波（青）
        if (leftOn || rightOn) {
          drawLine(
            (x) => {
              let y = 0;

              if (leftOn) {
                const e = smoothstep(clamp((vL * t - x) / smooth, 0, 1));
                y += e * leftAmp * Math.sin(kL * x - wL * t);
              }

              if (rightOn) {
                const e = smoothstep(clamp((vR * t - (L - x)) / smooth, 0, 1));
                y += e * rightAmp * Math.sin(kR * (L - x) - wR * t);
              }

              return y;
            },
            "rgba(0, 140, 255, 0.65)",
            3,
          );
        }

        // 左から（緑）
        if (leftOn) {
          drawLine(
            (x) => {
              const e = smoothstep(clamp((vL * t - x) / smooth, 0, 1));
              return e * leftAmp * Math.sin(kL * x - wL * t);
            },
            "rgb(0, 220, 120)",
            2,
          );
        }

        // 右から（赤）
        if (rightOn) {
          drawLine(
            (x) => {
              const e = smoothstep(clamp((vR * t - (L - x)) / smooth, 0, 1));
              return e * rightAmp * Math.sin(kR * (L - x) - wR * t);
            },
            "rgb(255, 60, 60)",
            2,
          );
        }
      }

      // ========= 壁モード（当時のやつ） =========
      if (wallOn && leftOn) {
        const reachTime = mid / vL;
        const reflected = t >= reachTime;
        const sign = wallType === "fixed" ? -1 : 1;

        // 入射（左→壁）
        drawLine(
          (x) => {
            if (x > mid) return 0;
            const e = smoothstep(clamp((vL * t - x) / smooth, 0, 1));
            return e * leftAmp * Math.sin(kL * x - wL * t);
          },
          "rgb(0, 220, 120)",
          2,
        );

        // 反射（壁→左）
        if (reflected) {
          drawLine(
            (x) => {
              if (x > mid) return 0;
              const d = vL * (t - reachTime);
              const e = smoothstep(clamp((d - (mid - x)) / smooth, 0, 1));
              return sign * e * leftAmp * Math.sin(kL * x + wL * t);
            },
            "rgb(255, 140, 0)",
            2,
          );
        }

        // 定常波（入射＋反射）
        if (reflected) {
          drawLine(
            (x) => {
              if (x > mid) return 0;

              // 壁を x = 0 とした座標
              const X = mid - x;

              if (wallType === "fixed") {
                // 固定端：壁は必ず節
                return 2 * leftAmp * Math.sin(kL * X) * Math.cos(wL * t);
              } else {
                // 自由端：壁は必ず腹
                return 2 * leftAmp * Math.cos(kL * X) * Math.sin(wL * t);
              }
            },
            "rgba(0, 140, 255, 0.85)",
            3,
          );
        }

        // 壁ライン
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        ctx.moveTo(mid, 0);
        ctx.lineTo(mid, canvas.height);
        ctx.stroke();
      }
      if (!pausedRef.current) {
        tRef.current += 0.03;
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [
    leftOn,
    rightOn,
    leftAmp,
    rightAmp,
    leftLambda,
    rightLambda,
    leftFreq,
    rightFreq,
    speed,
    wallOn,
    wallType,
    paused,
  ]);

  return <canvas ref={canvasRef} />;
}
