'use client';

import { Card } from '@/components/ui/Card';
import { OnChainPosition } from '@/hooks/usePositions';
import { PositionHistory } from '@/lib/uniswap-subgraph';
import { V4PositionHistory } from '@/lib/v4-subgraph';
import { formatNumber, cn } from '@/lib/utils';
import { ExternalLink, TrendingUp, TrendingDown, Droplets, Info } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { fetchTokenPrices } from '@/lib/api';

interface WalletPositionCardProps {
  position: OnChainPosition;
  prices?: Record<string, number>;
  positionHistory?: PositionHistory | null;
  v4PositionHistory?: V4PositionHistory | null;
}

// Format large liquidity values in a human-readable way
function formatCompactLiquidity(liquidity: bigint): string {
  const num = Number(liquidity);
  if (num >= 1e18) return (num / 1e18).toFixed(2) + 'E';
  if (num >= 1e15) return (num / 1e15).toFixed(2) + 'P';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

// Price Range Slider Component
function PriceRangeSlider({ tickLower, tickUpper, currentTick, inRange }: {
  tickLower: number;
  tickUpper: number;
  currentTick?: number;
  inRange: boolean;
}) {
  // Calculate the position of the current tick within the range
  // We need to visualize where the current price is relative to the position's range
  const rangeWidth = tickUpper - tickLower;
  const padding = rangeWidth * 0.2; // 20% padding on each side for visualization
  const visualMin = tickLower - padding;
  const visualMax = tickUpper + padding;
  const visualRange = visualMax - visualMin;

  // Position percentages
  const lowerPercent = ((tickLower - visualMin) / visualRange) * 100;
  const upperPercent = ((tickUpper - visualMin) / visualRange) * 100;
  const currentPercent = currentTick !== undefined
    ? Math.max(0, Math.min(100, ((currentTick - visualMin) / visualRange) * 100))
    : 50;

  return (
    <div className="relative w-full h-2 mt-2">
      {/* Background track */}
      <div className="absolute inset-0 bg-gray-700 rounded-full" />

      {/* Active range */}
      <div
        className="absolute h-full bg-gray-500 rounded-full"
        style={{
          left: `${lowerPercent}%`,
          width: `${upperPercent - lowerPercent}%`,
        }}
      />

      {/* Lower bound marker */}
      <div
        className="absolute w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2 top-0"
        style={{ left: `${lowerPercent}%` }}
      />

      {/* Upper bound marker */}
      <div
        className="absolute w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2 top-0"
        style={{ left: `${upperPercent}%` }}
      />

      {/* Current price marker */}
      {currentTick !== undefined && (
        <div
          className={cn(
            "absolute w-3 h-3 rounded-full -translate-x-1/2 -top-0.5 border-2 border-card",
            inRange ? "bg-success" : "bg-danger"
          )}
          style={{ left: `${currentPercent}%` }}
        />
      )}
    </div>
  );
}

export function WalletPositionCard({ position, prices: externalPrices, positionHistory, v4PositionHistory }: WalletPositionCardProps) {
  const [localPrices, setLocalPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!externalPrices) {
      fetchTokenPrices().then(setLocalPrices);
    }
  }, [externalPrices]);

  const prices = externalPrices || localPrices;

  const tokenColors: Record<string, string> = {
    ETH: '#627eea',
    WETH: '#627eea',
    USDC: '#2775ca',
    USDT: '#26a17b',
    WBTC: '#f7931a',
    DAI: '#f5ac37',
    LINK: '#2a5ada',
    UNI: '#ff007a',
    ONDO: '#1a1a2e',
  };

  const token0Symbol = position.token0Symbol || 'TOKEN0';
  const token1Symbol = position.token1Symbol || 'TOKEN1';
  const token0Decimals = position.token0Decimals || 18;
  const token1Decimals = position.token1Decimals || 18;
  const chainName = position.chainName || 'Unknown';
  const chainId = position.chainId || 1;

  // Chain slug for Uniswap URL
  const chainSlug: Record<number, string> = {
    1: 'ethereum',
    42161: 'arbitrum',
    137: 'polygon',
    10: 'optimism',
    8453: 'base',
    56: 'bnb',
  };

  // Use calculated token amounts if available
  const token0Amount = position.token0Amount || 0;
  const token1Amount = position.token1Amount || 0;

  // Get token prices
  const token0Price = prices[token0Symbol] || prices['ETH'] || 0;
  const token1Price = prices[token1Symbol] || 0;

  // Calculate position value in USD
  const token0ValueUSD = token0Amount * token0Price;
  const token1ValueUSD = token1Amount * token1Price;
  const totalValueUSD = token0ValueUSD + token1ValueUSD;

  // Calculate uncollected fees in USD
  // Both V3 and V4 positions use pre-calculated uncollectedFees from the hook
  const isV4 = position.version === 'v4';
  const uncollectedFees0 = position.uncollectedFees0 || 0;
  const uncollectedFees1 = position.uncollectedFees1 || 0;

  const unclaimedFeesUSD = (uncollectedFees0 * token0Price) + (uncollectedFees1 * token1Price);

  // Use calculated inRange if available, otherwise fallback
  const inRange = position.inRange !== undefined ? position.inRange : Number(position.liquidity) > 0;

  // Fee tier display
  const feePercent = position.fee / 10000;

  // Get historical data from position history (if available)
  // Use V4 history for V4 positions, V3 history for V3 positions
  let depositsUSD = totalValueUSD; // Default fallback
  let claimedFeesUSD = 0;

  if (isV4 && v4PositionHistory) {
    // V4: Use ModifyLiquidity events for deposits and claims
    const hasDepositData = v4PositionHistory.depositedToken0 > 0 || v4PositionHistory.depositedToken1 > 0;
    if (hasDepositData) {
      depositsUSD = (v4PositionHistory.depositedToken0 * token0Price) + (v4PositionHistory.depositedToken1 * token1Price);
      claimedFeesUSD = (v4PositionHistory.claimedToken0 * token0Price) + (v4PositionHistory.claimedToken1 * token1Price);
    }
  } else if (!isV4 && positionHistory) {
    // V3: Use The Graph subgraph data
    depositsUSD = (positionHistory.depositedToken0 * token0Price) + (positionHistory.depositedToken1 * token1Price);
    claimedFeesUSD = (positionHistory.claimedFees0 * token0Price) + (positionHistory.claimedFees1 * token1Price);
  }

  // Total earnings = unclaimed + claimed
  const earnings = unclaimedFeesUSD + claimedFeesUSD;

  // Asset gain = current value - deposits
  const assetGain = totalValueUSD - depositsUSD;

  // Profit/Loss = Asset Gain + Earnings
  const profitLoss = assetGain + earnings;

  // HODL value = deposits at current prices (same as depositsUSD since we're using current prices)
  const hodlValue = depositsUSD;
  // Impermanent Loss = HODL value - Current value
  const impermanentLoss = hodlValue - totalValueUSD;
  // VS HODL = Earnings - Impermanent Loss
  const vsHodl = earnings - Math.max(0, impermanentLoss);

  // Get creation timestamp from the appropriate history source
  const createdTimestamp = isV4 && v4PositionHistory
    ? v4PositionHistory.createdTimestamp
    : positionHistory?.createdTimestamp;

  // Calculate position age in days
  const positionAgeDays = createdTimestamp
    ? (Date.now() - createdTimestamp) / (1000 * 60 * 60 * 24)
    : 30; // Default to 30 days if no history

  // APR = (daily earnings * 365 / deposits) * 100
  const dailyEarnings = positionAgeDays > 0 ? earnings / positionAgeDays : 0;
  const apr = depositsUSD > 0 ? ((dailyEarnings * 365) / depositsUSD) * 100 : 0;

  // Format opened date from position history
  const openedDate = createdTimestamp
    ? new Date(createdTimestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <Card className="p-4 hover:bg-card-hover transition-colors">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-card"
              style={{ backgroundColor: tokenColors[token0Symbol] || '#6366f1' }}
            >
              {token0Symbol.charAt(0)}
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-card"
              style={{ backgroundColor: tokenColors[token1Symbol] || '#6366f1' }}
            >
              {token1Symbol.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {token0Symbol}/{token1Symbol}
              </h3>
              <span className="px-1.5 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs font-medium">
                🦄
              </span>
              <span className="px-1.5 py-0.5 bg-success/10 text-success rounded text-xs font-semibold">
                {position.version?.toUpperCase() || 'V3'}
              </span>
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                ⚡
              </span>
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                {feePercent}%
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 text-xs rounded-full font-medium',
                  inRange
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger'
                )}
              >
                {inRange ? '● In range' : '● Out of Range'}
              </span>
            </div>
          </div>
        </div>

        <a
          href={position.version === 'v4'
            ? `https://app.uniswap.org/positions/v4/${chainSlug[chainId] || 'ethereum'}/${position.tokenId}`
            : `https://app.uniswap.org/positions/v3/${chainSlug[chainId] || 'ethereum'}/${position.tokenId}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          Details
        </a>
      </div>

      {/* Metrics Grid - Metrix Finance Style */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted mb-1">Current Liquidity</p>
          <p className="font-semibold text-sm">
            ${formatNumber(totalValueUSD, 2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Earnings</p>
          <p className="font-semibold text-sm text-success">
            ${formatNumber(earnings, 2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Profit/Loss</p>
          <p className={cn(
            "font-semibold text-sm",
            profitLoss >= 0 ? "text-success" : "text-danger"
          )}>
            ${formatNumber(profitLoss, 2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">VS HODL</p>
          <p className={cn(
            "font-semibold text-sm",
            vsHodl >= 0 ? "text-success" : "text-danger"
          )}>
            ${formatNumber(vsHodl, 2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">APR</p>
          <p className="font-semibold text-sm text-purple-400">
            {formatNumber(apr, 2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Opened</p>
          <p className="font-medium text-sm">
            {openedDate}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Price Range</p>
          <PriceRangeSlider
            tickLower={position.tickLower}
            tickUpper={position.tickUpper}
            currentTick={position.currentTick}
            inRange={inRange}
          />
        </div>
      </div>
    </Card>
  );
}
