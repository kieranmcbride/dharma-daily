
interface EnsoProps {
  opacity?: number;
  size?: number;
}

export function Enso({ opacity = 1, size = 160 }: EnsoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <path
        d="M80 20
           C105 18, 135 35, 140 65
           C145 90, 132 118, 110 130
           C88 142, 55 140, 35 122
           C15 104, 12 72, 28 50
           C40 33, 60 22, 80 20
           C88 19, 98 22, 105 28"
        stroke="#C8C8C0"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
