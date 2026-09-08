const LockedIllustration = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="100" cy="80" r="70" fill="hsl(211 100% 96%)" />
      
      {/* Lock body */}
      <rect x="70" y="70" width="60" height="50" rx="8" fill="hsl(211 100% 50%)" />
      
      {/* Lock shackle */}
      <path 
        d="M80 70 V55 C80 40, 120 40, 120 55 V70" 
        stroke="hsl(211 100% 40%)" 
        strokeWidth="8" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Keyhole */}
      <circle cx="100" cy="90" r="8" fill="hsl(211 100% 96%)" />
      <rect x="97" y="90" width="6" height="15" rx="2" fill="hsl(211 100% 96%)" />
      
      {/* Passport */}
      <rect x="135" y="85" width="35" height="50" rx="3" fill="hsl(28 100% 55%)" transform="rotate(-15 135 85)" />
      <rect x="142" y="95" width="20" height="15" rx="2" fill="white" transform="rotate(-15 142 95)" />
      
      {/* Stars/sparkles */}
      <circle cx="50" cy="50" r="3" fill="hsl(45 100% 55%)" />
      <circle cx="155" cy="45" r="2" fill="hsl(45 100% 55%)" />
      <circle cx="45" cy="110" r="2" fill="hsl(45 100% 55%)" />
    </svg>
  );
};

export default LockedIllustration;
