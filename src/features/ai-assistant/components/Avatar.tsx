type AvatarProps = {
  size: number;
  shape?: "circle" | "rounded";
  className?: string;
};

/** Ink → red gradient tile with a white "H" monogram. Decorative: the name is always shown next to it. */
export default function Avatar({ size, shape = "circle", className = "" }: AvatarProps) {
  return (
    <span
      className={`hm-assist-avatar hm-assist-avatar--${shape} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.48) }}
      aria-hidden="true"
    >
      HG
    </span>
  );
}
