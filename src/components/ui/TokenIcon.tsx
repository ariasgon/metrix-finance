'use client';

import { cn } from '@/lib/utils';

interface TokenIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
  xl: 'w-12 h-12',
};

// Token colors for visual identification
const tokenColors: Record<string, string> = {
  ETH: '#627eea',
  WETH: '#627eea',
  USDC: '#2775ca',
  USDT: '#26a17b',
  WBTC: '#f7931a',
  BTC: '#f7931a',
  DAI: '#f5ac37',
  LINK: '#2a5ada',
  UNI: '#ff007a',
  AAVE: '#b6509e',
  CRV: '#3a7dc5',
  SUSHI: '#fa52a0',
  MATIC: '#8247e5',
  ARB: '#28a0f0',
  OP: '#ff0420',
  BASE: '#0052ff',
  ONDO: '#00d4aa',
  PEPE: '#3d9c3d',
  SHIB: '#ffa409',
  APE: '#0047ff',
  LDO: '#00a3ff',
  RPL: '#ff7b54',
  MKR: '#1aab9b',
  SNX: '#00d1ff',
  COMP: '#00d395',
  GRT: '#6747ed',
  FXS: '#000000',
  FRAX: '#000000',
  LUSD: '#2eb6ea',
  USDD: '#216bff',
  TUSD: '#2b2e7f',
  GUSD: '#00dcfa',
  BUSD: '#f0b90b',
};

const textSizeClasses = {
  sm: 'text-[8px]',
  md: 'text-[10px]',
  lg: 'text-xs',
  xl: 'text-sm',
};

export function TokenIcon({ symbol, size = 'md', className }: TokenIconProps) {
  const normalizedSymbol = symbol.toUpperCase();
  const color = tokenColors[normalizedSymbol] || '#00d4aa';

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white',
        sizeClasses[size],
        textSizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {normalizedSymbol.slice(0, 3)}
    </div>
  );
}

interface TokenPairIconProps {
  token0Symbol: string;
  token1Symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TokenPairIcon({ token0Symbol, token1Symbol, size = 'md', className }: TokenPairIconProps) {
  return (
    <div className={cn('flex -space-x-2', className)}>
      <TokenIcon symbol={token0Symbol} size={size} className="z-10 ring-2 ring-background" />
      <TokenIcon symbol={token1Symbol} size={size} className="z-0" />
    </div>
  );
}
