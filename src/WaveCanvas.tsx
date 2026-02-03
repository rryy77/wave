// WaveCanvas.tsx（もっと前のやつ：壁ボタン入れた直後・ストップ無し）

import { useRef, useEffect } from "react";

type WaveCanvasProps = {
  leftOn: boolean;
  rightOn: boolean;

  leftAmp: number;
  rightAmp: number;

  leftLambda: number;
  rightLambda: number;

  leftVib: number;
  rightVib: number;

  speed: number;

  /** 見た目の再生速度（1=等速、0.5=スローモーション、2=2倍速）。波の物理的な速さは変わらない */
  playbackSpeed: number;

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
  leftVib,
  rightVib,
  speed,
  playbackSpeed,
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
      const L = canvas.width;
      const H = canvas.height;

      // 背景（濃いグラデーション風）
      ctx.fillStyle = "#06080b";
      ctx.fillRect(0, 0, L, H);
      // 中央の基準線（薄く）
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(L, H / 2);
      ctx.stroke();

      const mid = L / 2;

      const vL = leftLambda * leftVib * speed;
      const vR = rightLambda * rightVib * speed;

      const kL = (2 * Math.PI) / leftLambda;
      const kR = (2 * Math.PI) / rightLambda;
      const wL = 2 * Math.PI * leftVib;
      const wR = 2 * Math.PI * rightVib;

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
        // 固定端: 壁で y=0 → 反射は位相 -2*kL*mid、符号 +1。自由端: 壁で dy/dx=0 → 符号 -1
        const reflSign = wallType === "fixed" ? 1 : -1;
        const phaseAtWall = 2 * kL * mid;

        // 入射（左→壁）。右側にも「壁で止まる前の続き」として表示
        drawLine(
          (x) => {
            const e = smoothstep(clamp((vL * t - x) / smooth, 0, 1));
            return e * leftAmp * Math.sin(kL * x - wL * t);
          },
          "rgb(0, 220, 120)",
          2,
        );

        // 反射（壁→左）：境界条件を満たす位相 -2*kL*mid を入れる
        if (reflected) {
          drawLine(
            (x) => {
              if (x > mid) return 0;
              const d = vL * (t - reachTime);
              const e = smoothstep(clamp((d - (mid - x)) / smooth, 0, 1));
              return (
                reflSign *
                e *
                leftAmp *
                Math.sin(kL * x + wL * t - phaseAtWall)
              );
            },
            "rgb(255, 140, 0)",
            2,
          );
        }

        // 定常波（入射＋反射の重ね合わせ）。壁基準の座標 X = mid - x
        if (reflected) {
          drawLine(
            (x) => {
              if (x > mid) return 0;
              const X = mid - x;
              if (wallType === "fixed") {
                // 固定端：壁は節 → 2A sin(kL*X) cos(ωt - kL*mid)
                return (
                  2 *
                  leftAmp *
                  Math.sin(kL * X) *
                  Math.cos(wL * t - kL * mid)
                );
              } else {
                // 自由端：壁は腹 → 2A cos(kL*X) sin(ωt - kL*mid)
                return (
                  2 *
                  leftAmp *
                  Math.cos(kL * X) *
                  Math.sin(wL * t - kL * mid)
                );
              }
            },
            "rgba(0, 140, 255, 0.85)",
            3,
          );
        }

        // 壁ライン
        ctx.beginPath();
        ctx.strokeStyle = "rgba(34, 211, 238, 0.35)";
        ctx.lineWidth = 2;
        ctx.moveTo(mid, 0);
        ctx.lineTo(mid, H);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mid, 0);
        ctx.lineTo(mid, H);
        ctx.stroke();
      }
      if (!pausedRef.current) {
        tRef.current += 0.03 * playbackSpeed;
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
    leftVib,
    rightVib,
    speed,
    playbackSpeed,
    wallOn,
    wallType,
    paused,
  ]);

  return <canvas ref={canvasRef} />;
}
