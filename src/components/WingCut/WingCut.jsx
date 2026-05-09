export default function WingCut({ fill = '#fff', bgColor, style }) {
  return (
    <svg
      className="wc"
      viewBox="0 0 1440 72"
      preserveAspectRatio="none"
      height="72"
      aria-hidden="true"
      style={{ background: bgColor, ...style }}
    >
      <path d="M 0 0 L 1440 0 L 1440 28 Q 720 90 0 28 Z" fill={fill} />
    </svg>
  );
}
