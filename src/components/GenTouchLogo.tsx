import React, { useState } from 'react';

interface GenTouchLogoProps {
  className?: string;
}

export const GenTouchLogo: React.FC<GenTouchLogoProps> = ({ 
  className = "h-10 sm:h-12 w-auto max-w-[170px]" 
}) => {
  const [imgError, setImgError] = useState(false);

  // If logo.png exists and loads, show it. Otherwise show guaranteed inline SVG
  if (!imgError) {
    return (
      <img
        src="/logo.png"
        alt="GEN-TOUCH"
        className={`${className} object-contain transition duration-300 group-hover:scale-105 drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${className} flex items-center justify-center transition duration-300 group-hover:scale-105`}>
      <svg
        viewBox="0 0 900 620"
        className="w-full h-full drop-shadow-[0_2px_10px_rgba(239,68,68,0.35)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="silverChromeTop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" stopOpacity="0.2" />
            <stop offset="15%" stopColor="#cbd5e1" />
            <stop offset="30%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#f8fafc" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="chromeBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e2e8f0" />
            <stop offset="55%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="laserRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff1a1a" />
            <stop offset="50%" stopColor="#e60000" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>
          <linearGradient id="touchRed3D" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="25%" stopColor="#e60000" />
            <stop offset="60%" stopColor="#b30000" />
            <stop offset="100%" stopColor="#660000" />
          </linearGradient>
        </defs>

        <g>
          <path
            d="M 52,298 C 110,265 240,205 450,195 C 640,195 780,242 858,266 C 820,268 765,258 720,248 C 550,210 380,214 260,260 C 180,290 110,305 52,298 Z"
            fill="url(#silverChromeTop)"
          />
          <path
            d="M 285,245 C 370,208 530,208 642,238 C 585,225 435,224 330,242 Z"
            fill="#0a0c10"
            opacity="0.9"
          />
          <path
            d="M 330,242 C 435,224 585,225 642,238 C 560,242 450,250 365,252 Z"
            fill="#ffffff"
            opacity="0.5"
          />
          <path
            d="M 46,298 C 90,285 145,270 170,278 C 130,292 85,310 46,298 Z"
            fill="url(#silverChromeTop)"
          />
          <path
            d="M 148,284 C 180,268 250,270 282,296 C 262,294 200,278 165,286 Z"
            fill="url(#silverChromeTop)"
            opacity="0.9"
          />
          <path
            d="M 460,265 C 570,248 720,250 855,274 C 775,272 630,260 520,272 Z"
            fill="url(#laserRed)"
          />
          <path
            d="M 520,266 C 620,254 750,258 840,274 C 760,268 640,260 550,268 Z"
            fill="#ff8080"
          />
        </g>

        <g transform="skewX(-10)">
          <text
            x="175"
            y="382"
            fontFamily="'Montserrat', 'Arial Black', Impact, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="94"
            fill="url(#chromeBevel)"
            stroke="#ffffff"
            strokeWidth="1.5"
            letterSpacing="2"
          >
            GEN-
          </text>
          <text
            x="470"
            y="382"
            fontFamily="'Montserrat', 'Arial Black', Impact, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="94"
            fill="url(#touchRed3D)"
            stroke="#ff6666"
            strokeWidth="1"
            letterSpacing="2"
          >
            Touch
          </text>
        </g>

        <g>
          <line x1="140" y1="416" x2="210" y2="416" stroke="url(#laserRed)" strokeWidth="2.5" strokeLinecap="round" />
          <text
            x="450"
            y="420"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="700"
            fontSize="16.5"
            textAnchor="middle"
            fill="#cbd5e1"
            letterSpacing="5.5"
            opacity="0.95"
          >
            DRIVEN BY GEN. PERFECTED BY TOUCH.
          </text>
          <line x1="690" y1="416" x2="760" y2="416" stroke="url(#laserRed)" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        <path
          d="M 260,432 C 370,490 530,490 640,432 C 550,476 350,476 260,432 Z"
          fill="url(#silverChromeTop)"
          stroke="#ffffff"
          strokeWidth="0.8"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};
