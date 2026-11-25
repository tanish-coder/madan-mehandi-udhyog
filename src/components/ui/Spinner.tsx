import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-11 h-11 border-[3px]',
};

/**
 * Animated ring spinner in MMU henna color (#c06720).
 */
const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full border-solid animate-spin ${sizeMap[size]} ${className}`}
      style={{
        borderColor: '#e8c9a8',
        borderTopColor: '#c06720',
      }}
    />
  );
};

export default Spinner;
