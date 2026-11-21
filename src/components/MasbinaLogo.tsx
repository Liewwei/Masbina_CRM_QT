import { useId } from 'react';

interface MasbinaLogoProps {
  className?: string;
}

export function MasbinaLogo({ className = 'h-16 w-auto shrink-0' }: MasbinaLogoProps) {
  const uid = useId().replace(/:/g, '');
  const topArcTextId = `masbina-security-arc-${uid}`;
  const bottomArcTextId = `masbina-alarm-arc-${uid}`;
  const sinceArcTextId = `masbina-since-arc-${uid}`;

  return (
    <svg
      viewBox="0 0 260 185"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Masbina Technology S/B — Security & Alarm Since 1986"
      className={className}
    >
      <defs>
        {/* Upper clockwise arc baseline for SECURITY */}
        <path
          id={topArcTextId}
          d="M 81.1 64.2 A 53.5 53.5 0 0 1 153.5 37.9"
        />
        {/* Lower left-to-right arc baseline for ALARM */}
        <path
          id={bottomArcTextId}
          d="M 100.4 141.6 A 63 63 0 0 0 188.4 109.6"
        />
        {/* Curved tagline baseline for Since 1986 */}
        <path
          id={sinceArcTextId}
          d="M 71.1 151.4 A 88 88 0 0 0 188.9 151.4"
        />
      </defs>

      {/* Upper Clockwise Red Arrow Arc (~9:20 sweeping to ~1 o'clock arrowhead) */}
      <path
        d="M 60.1 73.7 A 71 71 0 0 1 167.6 25.8 L 171.9 19.0 L 178.1 53.6 L 149.6 54.6 L 153.8 47.8 A 45 45 0 0 0 85.7 78.2 Z"
        fill="#E11D24"
      />
      {/* Crisp white diagonal notch near upper arrowhead */}
      <line
        x1="147.8"
        y1="47.2"
        x2="166.8"
        y2="22.4"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="butt"
      />

      {/* Lower Clockwise Red Arrow Arc (~3:20 sweeping to ~7 o'clock arrowhead) */}
      <path
        d="M 199.9 98.3 A 71 71 0 0 1 92.4 146.2 L 88.1 153.0 L 81.9 118.4 L 110.4 117.4 L 106.2 124.2 A 45 45 0 0 0 174.3 93.8 Z"
        fill="#E11D24"
      />
      {/* Crisp white diagonal notch near lower arrowhead */}
      <line
        x1="112.2"
        y1="124.8"
        x2="93.2"
        y2="149.6"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="butt"
      />

      {/* Curved White Uppercase SECURITY along upper red arc */}
      <text
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13.5"
        fontWeight="800"
        letterSpacing="1.6"
      >
        <textPath href={`#${topArcTextId}`} startOffset="50%" textAnchor="middle">
          SECURITY
        </textPath>
      </text>

      {/* Curved White Uppercase ALARM along lower red arc */}
      <text
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13.5"
        fontWeight="800"
        letterSpacing="2.2"
      >
        <textPath href={`#${bottomArcTextId}`} startOffset="50%" textAnchor="middle">
          ALARM
        </textPath>
      </text>

      {/* Center Royal-Blue Serif Wordmark MasBina with Crisp White Halo */}
      <text
        x="130"
        y="99"
        textAnchor="middle"
        fill="#1E3A8A"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinejoin="round"
        paintOrder="stroke fill"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="45"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        MasBina
      </text>

      {/* Curved Royal-Blue Sans-Serif Tagline Since 1986 */}
      <text
        fill="#1E3A8A"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13.5"
        fontWeight="700"
        letterSpacing="0.8"
      >
        <textPath href={`#${sinceArcTextId}`} startOffset="50%" textAnchor="middle">
          Since 1986
        </textPath>
      </text>
    </svg>
  );
}
