type AvatarProps = {
  size: 56 | 36 | 32;
  /** Green "online" dot at the bottom right. */
  online?: boolean;
};

/** Circle split like the group logo: brown top, blue bottom, white "HG", white ring.
    Decorative: the assistant's name is always given in text. */
export default function Avatar({ size, online = false }: AvatarProps) {
  return (
    <span className={`hm-assist-avatar hm-assist-avatar--${size}`} aria-hidden="true">
      HG
      {online && <span className="hm-assist-online" />}
    </span>
  );
}
