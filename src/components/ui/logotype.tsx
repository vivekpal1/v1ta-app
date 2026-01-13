'use client';

interface LogotypeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubheading?: boolean;
  interactive?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-5xl sm:text-6xl lg:text-7xl',
  xl: 'text-6xl sm:text-7xl lg:text-8xl',
};

const glowStyles = {
  sm: {
    textShadow: `
      0 0 10px rgba(58, 89, 64, 0.6),
      0 0 20px rgba(58, 89, 64, 0.4),
      0 0 30px rgba(58, 89, 64, 0.2)
    `,
  },
  md: {
    textShadow: `
      0 0 15px rgba(58, 89, 64, 0.7),
      0 0 30px rgba(58, 89, 64, 0.5),
      0 0 45px rgba(58, 89, 64, 0.3),
      0 0 60px rgba(58, 89, 64, 0.15)
    `,
  },
  lg: {
    textShadow: `
      0 0 20px rgba(58, 89, 64, 0.8),
      0 0 40px rgba(58, 89, 64, 0.6),
      0 0 60px rgba(58, 89, 64, 0.4),
      0 0 80px rgba(58, 89, 64, 0.2)
    `,
  },
  xl: {
    textShadow: `
      0 0 25px rgba(58, 89, 64, 0.8),
      0 0 50px rgba(58, 89, 64, 0.6),
      0 0 75px rgba(58, 89, 64, 0.4),
      0 0 100px rgba(58, 89, 64, 0.2)
    `,
  },
};

export const Logotype = ({
  size = 'xl',
  showSubheading = true,
  interactive = false,
  className = ''
}: LogotypeProps) => {
  return (
    <div className={`text-center ${className}`}>
      <h1
        className={`text-primary ${sizeClasses[size]} lowercase select-none`}
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontWeight: 400,
          fontVariantNumeric: 'lining-nums',
          letterSpacing: size === 'sm' ? '0.15em' : '0.2em',
          ...glowStyles[size],
        }}
      >
        v<span style={{ fontStyle: 'italic' }}>1</span>ta
      </h1>
      {showSubheading && (
        <p
          className="text-text-tertiary text-sm font-light tracking-[0.4em] uppercase mt-4"
        >
          <span className="line-through opacity-50">CeDeFi</span> DeFi
        </p>
      )}
    </div>
  );
};
