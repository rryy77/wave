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
}: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const L = canvas.width;

      const vL = leftLambda * leftFreq * speed;
      const vR = rightLambda * rightFreq * speed;

      const kL = (2 * Math.PI) / leftLambda;
      const kR = (2 * Math.PI) / rightLambda;
      const wL = 2 * Math.PI * leftFreq;
      const wR = 2 * Math.PI * rightFreq;

      const smooth = 60;

      // 定常波（濃い未来ブルー）
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

      t += 0.03;
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
  ]);

  return <canvas ref={canvasRef} />;
}
