import React from 'react';

const QuickBiteLogo = ({ 
  variant = 'neon', 
  size = 'medium', 
  className = '' 
}) => {
  const sizes = {
    small: { width: 120, height: 36 },
    medium: { width: 200, height: 60 },
    large: { width: 280, height: 84 }
  };

  const logos = {
    neon: '/src/assets/logo-quickbite-neon.svg',
    modern: '/src/assets/logo-quickbite-modern.svg',
    delivery: '/src/assets/logo-quickbite-delivery.svg',
    burger: '/src/assets/logo-quickbite-burger.svg'
  };

  return (
    <div className={`quickbite-logo ${className}`}>
      <img
        src={logos[variant]}
        alt="QuickBite Logo"
        width={sizes[size].width}
        height={sizes[size].height}
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))',
          transition: 'all 0.3s ease'
        }}
        className="hover:scale-105 transition-transform"
      />
    </div>
  );
};

export default QuickBiteLogo;
