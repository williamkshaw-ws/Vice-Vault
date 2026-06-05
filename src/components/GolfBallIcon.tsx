import React from 'react';

interface GolfBallIconProps extends React.SVGProps<SVGSVGElement> {
  active?: boolean;
  activeColor?: string;
}

export const GolfBallIcon: React.FC<GolfBallIconProps> = ({ 
  active = false, 
  activeColor = '#eab308', // Default yellow/gold
  className = '', 
  ...props 
}) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill={active ? activeColor : 'none'} 
      stroke={active ? activeColor : 'currentColor'} 
      strokeWidth={active ? '1.5' : '1.5'}
      className={`transition-colors duration-200 ${className}`}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="7" r="0.75" fill={active ? "#000" : "currentColor"} stroke="none" />
      <circle cx="9" cy="9.5" r="0.75" fill={active ? "#000" : "currentColor"} stroke="none" />
      <circle cx="15" cy="9.5" r="0.75" fill={active ? "#000" : "currentColor"} stroke="none" />
      <circle cx="7" cy="13" r="0.75" fill={active ? "#000" : "currentColor"} stroke="none" />
      <circle cx="17" cy="13" r="0.75" fill={active ? "#000" : "currentColor"} stroke="none" />
      <circle cx="10" cy="15.5" r="0.75" fill={active ? "#000" : "currentColor"} stroke="none" />
      <circle cx="14" cy="15.5" r="0.75" fill={active ? "#000" : "currentColor"} stroke="none" />
      <circle cx="12" cy="12" r="0.75" fill={active ? "#000" : "currentColor"} stroke="none" />
    </svg>
  );
};
