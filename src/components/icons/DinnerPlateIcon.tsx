import { SVGProps } from 'react';

export const DinnerPlateIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Plate */}
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx="12"
      cy="12"
      r="6"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
      opacity="0.3"
    />
    
    {/* Fork on left */}
    <line
      x1="6"
      y1="8"
      x2="6"
      y2="16"
      stroke="currentColor"
      strokeWidth="1"
    />
    <line
      x1="5"
      y1="8"
      x2="5"
      y2="12"
      stroke="currentColor"
      strokeWidth="1"
    />
    <line
      x1="7"
      y1="8"
      x2="7"
      y2="12"
      stroke="currentColor"
      strokeWidth="1"
    />
    
    {/* Knife on right */}
    <line
      x1="18"
      y1="8"
      x2="18"
      y2="16"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M17.5 8 L18.5 8 L18.5 11 L17.5 11 Z"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
);