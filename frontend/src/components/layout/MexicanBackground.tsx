import React from 'react';

interface MexicanBackgroundProps {
  children: React.ReactNode;
}

const MexicanBackground: React.FC<MexicanBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Festive top border pattern */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-white via-red-500 to-green-500 opacity-40 z-50"></div>

      {/* Top left - Chili pepper */}
      <div className="fixed top-24 left-10 opacity-8 pointer-events-none">
        <svg width="80" height="80" viewBox="0 0 100 100" className="text-red-600">
          <path
            fill="currentColor"
            d="M40,10 Q35,5 30,8 Q25,11 27,16 L35,35 Q38,42 42,48 Q45,52 48,58 Q50,63 50,70 Q50,80 45,85 Q40,90 32,88 Q25,86 22,78 Q20,72 22,65 Q24,58 28,52 L25,48 Q20,55 18,63 Q15,75 20,85 Q25,95 38,98 Q50,100 60,93 Q68,87 68,75 Q68,65 64,55 Q60,45 52,35 L48,20 Q47,15 43,12 Q40,10 40,10 Z"
          />
          <path
            fill="#10b981"
            d="M30,8 Q32,5 35,6 Q40,8 42,12 L45,18 Q42,15 38,14 Q34,13 31,15 Q28,17 30,20 L35,30 Q32,25 30,18 Q28,12 30,8 Z"
          />
        </svg>
      </div>

      {/* Top right - Cactus */}
      <div className="fixed top-32 right-16 opacity-10 pointer-events-none">
        <svg width="60" height="100" viewBox="0 0 60 100" className="text-green-600">
          <rect x="22" y="30" width="16" height="65" rx="8" fill="currentColor" />
          <rect x="10" y="45" width="16" height="25" rx="8" fill="currentColor" />
          <rect x="34" y="40" width="16" height="30" rx="8" fill="currentColor" />
          <circle cx="18" cy="50" r="2" fill="#fff" opacity="0.6" />
          <circle cx="18" cy="58" r="2" fill="#fff" opacity="0.6" />
          <circle cx="30" cy="45" r="2" fill="#fff" opacity="0.6" />
          <circle cx="30" cy="55" r="2" fill="#fff" opacity="0.6" />
          <circle cx="30" cy="65" r="2" fill="#fff" opacity="0.6" />
          <circle cx="42" cy="52" r="2" fill="#fff" opacity="0.6" />
          <circle cx="42" cy="60" r="2" fill="#fff" opacity="0.6" />
        </svg>
      </div>

      {/* Bottom left - Avocado */}
      <div className="fixed bottom-32 left-16 opacity-10 pointer-events-none">
        <svg width="70" height="70" viewBox="0 0 100 100" className="text-green-600">
          <ellipse cx="50" cy="55" rx="30" ry="40" fill="currentColor" />
          <ellipse cx="50" cy="55" rx="18" ry="24" fill="#fef3c7" />
          <circle cx="50" cy="55" r="10" fill="#92400e" />
        </svg>
      </div>

      {/* Bottom right - Lime slices */}
      <div className="fixed bottom-24 right-20 opacity-10 pointer-events-none rotate-12">
        <svg width="60" height="60" viewBox="0 0 100 100" className="text-green-600">
          <circle cx="50" cy="50" r="40" fill="currentColor" />
          <circle cx="50" cy="50" r="30" fill="#d9f99d" />
          <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="2" />
          <line x1="30" y1="30" x2="70" y2="70" stroke="currentColor" strokeWidth="2" />
          <line x1="70" y1="30" x2="30" y2="70" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Scattered small chili peppers */}
      <div className="fixed top-1/3 left-1/4 opacity-8 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 100 100" className="text-red-500">
          <path
            fill="currentColor"
            d="M50,20 Q48,25 48,32 Q48,40 45,48 Q42,55 40,60 Q38,65 42,68 Q46,70 50,66 Q54,62 56,55 Q58,48 58,40 Q58,32 56,28 Q54,24 52,22 Q50,20 50,20 Z"
          />
        </svg>
      </div>

      <div className="fixed top-2/3 right-1/3 opacity-8 pointer-events-none rotate-45">
        <svg width="40" height="40" viewBox="0 0 100 100" className="text-red-500">
          <path
            fill="currentColor"
            d="M50,20 Q48,25 48,32 Q48,40 45,48 Q42,55 40,60 Q38,65 42,68 Q46,70 50,66 Q54,62 56,55 Q58,48 58,40 Q58,32 56,28 Q54,24 52,22 Q50,20 50,20 Z"
          />
        </svg>
      </div>

      {/* Taco icon - middle left */}
      <div className="fixed top-1/2 left-8 opacity-8 pointer-events-none">
        <svg width="70" height="70" viewBox="0 0 100 100" className="text-yellow-600">
          <path
            fill="currentColor"
            d="M20,70 Q20,40 50,30 Q80,40 80,70 L75,70 Q75,45 50,38 Q25,45 25,70 Z"
          />
          <rect x="30" y="50" width="40" height="8" fill="#10b981" opacity="0.8" />
          <rect x="35" y="58" width="30" height="6" fill="#ef4444" opacity="0.8" />
        </svg>
      </div>

      {/* Maracas - middle right */}
      <div className="fixed top-1/2 right-12 opacity-10 pointer-events-none -rotate-12">
        <svg width="50" height="80" viewBox="0 0 50 100" className="text-orange-600">
          <circle cx="25" cy="25" r="20" fill="currentColor" />
          <rect x="22" y="20" width="6" height="60" fill="#92400e" />
          <line x1="19" y1="25" x2="31" y2="25" stroke="#fff" strokeWidth="2" opacity="0.4" />
          <line x1="20" y1="30" x2="30" y2="30" stroke="#fff" strokeWidth="2" opacity="0.4" />
        </svg>
      </div>

      {/* Main content with higher z-index */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MexicanBackground;
