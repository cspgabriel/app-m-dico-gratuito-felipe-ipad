import React from 'react';

type BrandLogoProps = {
  markOnly?: boolean;
  className?: string;
  markClassName?: string;
  textClassName?: string;
  dark?: boolean;
};

export function BrandMark({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 96" role="img" aria-label="Clinicafy">
      <defs>
        <linearGradient id="clinicafy-mark" x1="12" y1="84" x2="84" y2="12">
          <stop stopColor="#1677FF" />
          <stop offset="0.55" stopColor="#2CC7FF" />
          <stop offset="1" stopColor="#00D1B2" />
        </linearGradient>
      </defs>
      <path
        d="M36 8h24c8.8 0 16 7.2 16 16v12h12v24H76v12c0 8.8-7.2 16-16 16H36c-8.8 0-16-7.2-16-16V60H8V36h12V24C20 15.2 27.2 8 36 8Zm0 10c-3.3 0-6 2.7-6 6v22H18v4h22v22c0 3.3 2.7 6 6 6h24c3.3 0 6-2.7 6-6V50h22v-4H66V24c0-3.3-2.7-6-6-6H36Z"
        fill="url(#clinicafy-mark)"
      />
      <path d="M44 35h8v26h-8zM35 44h26v8H35z" fill="#1677FF" />
    </svg>
  );
}

export default function BrandLogo({
  markOnly = false,
  className = 'flex items-center gap-2',
  markClassName = 'w-10 h-10',
  textClassName = 'text-xl font-black tracking-tight',
  dark = false,
}: BrandLogoProps) {
  return (
    <div className={className}>
      <BrandMark className={markClassName} />
      {!markOnly && (
        <span className={textClassName}>
          <span className={dark ? 'text-white' : 'text-[#0D183D]'}>Clinica</span>
          <span className="text-[#1677FF]">fy</span>
        </span>
      )}
    </div>
  );
}
