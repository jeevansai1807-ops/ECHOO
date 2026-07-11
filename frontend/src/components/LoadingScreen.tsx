import React from 'react';

export function LoadingScreen() {
  return (
    <div className="main-container bg-[#0f172a] fixed inset-0 z-50">
      <div className="loader w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 800 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Linear gradients could go here if needed */}
          </defs>

          {/* Background Traces */}
          <path className="trace-bg" d="M 100,300 L 250,300 L 300,250 L 350,250" />
          <path className="trace-bg" d="M 700,300 L 550,300 L 500,350 L 450,350" />
          <path className="trace-bg" d="M 400,100 L 400,200 L 350,250" />
          <path className="trace-bg" d="M 400,500 L 400,400 L 450,350" />
          <path className="trace-bg" d="M 200,150 L 300,150 L 350,200 L 350,250" />

          {/* Flow Traces */}
          <path className="trace-flow blue" d="M 100,300 L 250,300 L 300,250 L 350,250" />
          <path className="trace-flow purple" d="M 700,300 L 550,300 L 500,350 L 450,350" />
          <path className="trace-flow yellow" d="M 400,100 L 400,200 L 350,250" />
          <path className="trace-flow green" d="M 400,500 L 400,400 L 450,350" />
          <path className="trace-flow red" d="M 200,150 L 300,150 L 350,200 L 350,250" />

          {/* Chip Pins (Left/Right) */}
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={`pin-left-${i}`}>
              <line x1="330" y1={235 + i * 15} x2="350" y2={235 + i * 15} className="chip-pin" />
              <line x1="450" y1={235 + i * 15} x2="470" y2={235 + i * 15} className="chip-pin" />
            </React.Fragment>
          ))}
          {/* Chip Pins (Top/Bottom) */}
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={`pin-top-${i}`}>
              <line x1={355 + i * 15} y1="210" x2={355 + i * 15} y2="230" className="chip-pin" />
              <line x1={355 + i * 15} y1="370" x2={355 + i * 15} y2="390" className="chip-pin" />
            </React.Fragment>
          ))}

          {/* Chip Body */}
          <rect x="350" y="230" width="100" height="140" className="chip-body fill-[#1e293b] stroke-[#94a3b8]" strokeWidth="2" />
          
          {/* Chip Text */}
          <text x="400" y="300" textAnchor="middle" dominantBaseline="middle" className="chip-text fill-white text-xl">
            ECHO
          </text>
          <text x="400" y="325" textAnchor="middle" dominantBaseline="middle" className="fill-[#94a3b8] text-[10px] tracking-[2px]">
            PROCESSING
          </text>
        </svg>
      </div>
    </div>
  );
}
