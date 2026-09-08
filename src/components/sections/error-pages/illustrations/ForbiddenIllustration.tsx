const ForbiddenIllustration = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="100" cy="80" r="70" fill="hsl(211 100% 96%)" />
      
      {/* Road/path */}
      <path d="M20 120 Q60 100, 100 110 Q140 120, 180 100" fill="hsl(215 25% 90%)" />
      <path d="M40 115 L60 115" stroke="white" strokeWidth="3" strokeDasharray="8 6" />
      <path d="M80 112 L100 112" stroke="white" strokeWidth="3" strokeDasharray="8 6" />
      <path d="M120 115 L140 115" stroke="white" strokeWidth="3" strokeDasharray="8 6" />
      
      {/* Stop sign */}
      <polygon 
        points="100,30 130,45 130,75 100,90 70,75 70,45" 
        fill="hsl(0 72% 55%)" 
        stroke="white" 
        strokeWidth="3"
      />
      <text x="100" y="67" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">STOP</text>
      
      {/* Sign pole */}
      <rect x="96" y="90" width="8" height="35" fill="hsl(215 25% 50%)" />
      
      {/* Confused traveler arrows */}
      <path d="M45 70 L35 60 M45 70 L55 60" stroke="hsl(28 100% 55%)" strokeWidth="3" strokeLinecap="round" />
      <path d="M155 70 L145 60 M155 70 L165 60" stroke="hsl(28 100% 55%)" strokeWidth="3" strokeLinecap="round" />
      
      {/* Backpack */}
      <rect x="30" y="75" width="20" height="25" rx="4" fill="hsl(211 100% 50%)" />
      <rect x="34" y="80" width="12" height="8" rx="2" fill="hsl(211 100% 70%)" />
    </svg>
  );
};

export default ForbiddenIllustration;
