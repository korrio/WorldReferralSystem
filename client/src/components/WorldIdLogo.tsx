interface WorldIdLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function WorldIdLogo({ className = "", width = 88, height = 88 }: WorldIdLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      fill="none" 
      viewBox="0 0 88 88"
      className={className}
    >
      <rect width="88" height="88" fill="#181818" rx="24"></rect>
      <rect width="88" height="88" fill="url(#paint0_radial_123738_86898)" fillOpacity="0.1" rx="24"></rect>
      <rect width="87" height="87" x="0.5" y="0.5" stroke="url(#paint1_linear_123738_86898)" rx="23.5"></rect>
      <path fill="#fff" d="M63.089 36.24a20.9 20.9 0 0 0-4.5-6.673 21 21 0 0 0-6.672-4.5 20.8 20.8 0 0 0-8.175-1.653c-2.832 0-5.583.554-8.175 1.653a20.9 20.9 0 0 0-6.672 4.5 21 21 0 0 0-4.5 6.673 20.9 20.9 0 0 0-1.648 8.172c0 2.831.554 5.584 1.653 8.176a20.9 20.9 0 0 0 4.5 6.673 21 21 0 0 0 6.672 4.5 20.9 20.9 0 0 0 8.175 1.653 20.8 20.8 0 0 0 8.175-1.653 20.9 20.9 0 0 0 6.672-4.5 21 21 0 0 0 4.5-6.673 20.9 20.9 0 0 0 1.653-8.176 21 21 0 0 0-1.658-8.172M36.77 42.44a7.82 7.82 0 0 1 7.561-5.84H58.91a16.8 16.8 0 0 1 1.773 5.84zm23.912 3.946a17 17 0 0 1-1.773 5.838H44.331c-3.625 0-6.682-2.482-7.56-5.838zm-28.996-14.03a16.93 16.93 0 0 1 12.056-4.995 16.93 16.93 0 0 1 12.345 5.294H44.331a11.68 11.68 0 0 0-8.315 3.446 11.7 11.7 0 0 0-3.28 6.344h-5.929a16.9 16.9 0 0 1 4.88-10.09m12.056 29.113a16.93 16.93 0 0 1-12.056-4.994 16.9 16.9 0 0 1-4.879-10.085h5.928a11.66 11.66 0 0 0 3.281 6.344 11.68 11.68 0 0 0 8.315 3.446h11.761c-.094.1-.194.2-.29.3a16.98 16.98 0 0 1-12.06 4.99"></path>
      <defs>
        <radialGradient id="paint0_radial_123738_86898" cx="0" cy="0" r="1" gradientTransform="rotate(51.561 -2.606 20.26)scale(99.9579 99.5269)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff"></stop>
          <stop offset="0.64" stopColor="#fff" stopOpacity="0"></stop>
        </radialGradient>
        <linearGradient id="paint1_linear_123738_86898" x1="44" x2="44" y1="0" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.3"></stop>
          <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
        </linearGradient>
      </defs>
    </svg>
  );
}