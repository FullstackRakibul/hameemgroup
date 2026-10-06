/* ── Flag artwork ──
   Simplified flags drawn on a shared 30×20 grid so every flag fits the same
   3:2 frame without distortion. Rendered as <symbol>s and placed with <use>. */

export type FlagCode = "bd" | "us" | "eu" | "jp" | "in" | "cn" | "hk";

// Five-point star centred on (cx, cy) with outer radius r, first point up.
function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.382;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const usStripes = Array.from({ length: 13 }, (_, i) => i).filter((i) => i % 2 === 0);
const usStars = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 6 }, (_, col) => [1.1 + col * 1.95, 1.15 + row * 2.1]),
).flat();
const euStars = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  return [15 + 6.2 * Math.sin(a), 10 - 6.2 * Math.cos(a)];
});
const cnSmallStars = [
  [10, 2],
  [12, 4],
  [12, 7],
  [10, 9],
];

export default function FlagDefs({ prefix }: { prefix: string }) {
  const id = (code: FlagCode) => `${prefix}-flag-${code}`;

  return (
    <>
      <symbol id={id("bd")} viewBox="0 0 30 20">
        <rect width="30" height="20" fill="#006a4e" />
        <circle cx="13.5" cy="10" r="6" fill="#f42a41" />
      </symbol>

      <symbol id={id("us")} viewBox="0 0 30 20">
        <rect width="30" height="20" fill="#fff" />
        {usStripes.map((i) => (
          <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#b22234" />
        ))}
        <rect width="12" height={(7 * 20) / 13} fill="#3c3b6e" />
        {usStars.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.4" fill="#fff" />
        ))}
      </symbol>

      <symbol id={id("eu")} viewBox="0 0 30 20">
        <rect width="30" height="20" fill="#003399" />
        {euStars.map(([x, y], i) => (
          <polygon key={i} points={star(x, y, 1)} fill="#ffcc00" />
        ))}
      </symbol>

      <symbol id={id("in")} viewBox="0 0 30 20">
        <rect width="30" height="20" fill="#fff" />
        <rect width="30" height={20 / 3} fill="#ff9933" />
        <rect y={40 / 3} width="30" height={20 / 3} fill="#138808" />
        <circle cx="15" cy="10" r="2.5" fill="none" stroke="#000080" strokeWidth="0.45" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="15"
            y1="10"
            x2={15 + 2.5 * Math.cos((i * Math.PI) / 6)}
            y2={10 + 2.5 * Math.sin((i * Math.PI) / 6)}
            stroke="#000080"
            strokeWidth="0.2"
          />
        ))}
        <circle cx="15" cy="10" r="0.5" fill="#000080" />
      </symbol>

      <symbol id={id("cn")} viewBox="0 0 30 20">
        <rect width="30" height="20" fill="#ee1c25" />
        <polygon points={star(5, 5, 3)} fill="#ffff00" />
        {cnSmallStars.map(([x, y]) => (
          <polygon key={`${x}-${y}`} points={star(x, y, 1)} fill="#ffff00" />
        ))}
      </symbol>

      <symbol id={id("hk")} viewBox="0 0 30 20">
        <rect width="30" height="20" fill="#de2910" />
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={i}
            d="M15 10 C 13.2 8.4 13.4 5.2 15.6 4.1 C 14.6 5.6 15.4 7.4 16.4 8.2 C 16 8.9 15.6 9.5 15 10 Z"
            fill="#fff"
            transform={`rotate(${i * 72} 15 10)`}
          />
        ))}
      </symbol>

      <symbol id={id("jp")} viewBox="0 0 30 20">
        <rect width="30" height="20" fill="#fff" />
        <circle cx="15" cy="10" r="6" fill="#bc002d" />
      </symbol>
    </>
  );
}
