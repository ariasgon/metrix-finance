'use client';

import { Card } from '@/components/ui/Card';
import { Position } from '@/types';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Trash2, ExternalLink, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface PositionCardProps {
  position: Position;
  onRemove: (id: string) => void;
}

export function PositionCard({ position, onRemove }: PositionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isProfit = position.pnl > 0;

  const tokenColors: Record<string, string> = {
    ETH: '#627eea',
    WETH: '#627eea',
    USDC: '#2775ca',
    USDT: '#26a17b',
    WBTC: '#f7931a',
    DAI: '#f5ac37',
    LINK: '#2a5ada',
    UNI: '#ff007a',
  };

  return (
    <Card className="p-4 hover:bg-card-hover transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-card"
              style={{ backgroundColor: tokenColors[position.pool.token0.symbol] || '#6366f1' }}
            >
              {position.pool.token0.symbol.charAt(0)}
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-card"
              style={{ backgroundColor: tokenColors[position.pool.token1.symbol] || '#6366f1' }}
            >
              {position.pool.token1.symbol.charAt(0)}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">
              {position.pool.token0.symbol}/{position.pool.token1.symbol}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{position.pool.feeTier / 10000}% fee</span>
              <span>•</span>
              <span>{position.pool.network}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-muted hover:text-foreground rounded transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => {
                  onRemove(position.id);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-card-hover w-full"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-card-hover w-full"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted mb-1">Deposited</p>
          <p className="font-medium">{formatCurrency(position.depositedUSD)}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Current Value</p>
          <p className="font-medium">{formatCurrency(position.currentValueUSD)}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Fees Earned</p>
          <p className="font-medium text-success">{formatCurrency(position.feesEarnedUSD)}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">PnL</p>
          <div className={cn('flex items-center gap-1 font-medium', isProfit ? 'text-success' : 'text-danger')}>
            {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{formatCurrency(Math.abs(position.pnl))}</span>
            <span className="text-xs">({formatPercent(position.pnlPercentage)})</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted">
          Range: {position.tickLower} - {position.tickUpper}
        </div>
        <div className="text-xs text-muted">
          Opened: {new Date(position.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}
