interface EnsoProps {
  opacity?: number;
  size?: number;
  pulsing?: boolean;
}

export function Enso({ opacity = 1, size = 160, pulsing = false }: EnsoProps) {
  return (
    <>
      {pulsing && (
        <style>{`
          @keyframes enso-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          .enso-pulsing {
            animation: enso-pulse 1.6s ease-in-out infinite;
          }
        `}</style>
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity }}
        className={pulsing ? 'enso-pulsing' : undefined}
      >
        <path
          d="M80 20
             C105 18, 135 35, 140 65
             C145 90, 132 118, 110 130
             C88 142, 55 140, 35 122
             C15 104, 12 72, 28 50
             C40 33, 60 22, 80 20
             C88 19, 98 22, 105 28"
          stroke="#1A1A18"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </>
  );
}
