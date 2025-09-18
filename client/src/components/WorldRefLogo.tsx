interface WorldRefLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function WorldRefLogo({ className = "", width = 200, height = 200 }: WorldRefLogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="100" cy="100" r="30" fill="white"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeWidth="2"/>
      <circle cx="100" cy="30" r="10" fill="white"/>
      <circle cx="100" cy="170" r="10" fill="white"/>
      <circle cx="30" cy="100" r="10" fill="white"/>
      <circle cx="170" cy="100" r="10" fill="white"/>
      <circle cx="50" cy="50" r="10" fill="white"/>
      <circle cx="150" cy="50" r="10" fill="white"/>
      <circle cx="50" cy="150" r="10" fill="white"/>
      <circle cx="150" cy="150" r="10" fill="white"/>
    </svg>
  );
}