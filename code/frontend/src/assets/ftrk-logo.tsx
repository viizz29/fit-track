const FtrkLogo = ({ width = 120, height = 40 }: { width?: number; height?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 120 40"
  >
    <defs>
      <linearGradient id="ftrk-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <rect x="0" y="4" width="5" height="32" rx="2.5" fill="url(#ftrk-gradient)" />
    <text
      x="16"
      y="31"
      fontFamily="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"
      fontSize="28"
      fontWeight="800"
      letterSpacing="-1"
      fill="url(#ftrk-gradient)"
    >
      Ftrk
    </text>
  </svg>
);

export default FtrkLogo;
