'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pool, SimulationResult } from '@/types';
import { formatCurrency, formatPercent, formatNumber, calculateImpermanentLoss } from '@/lib/utils';
import { Calculator, TrendingUp, AlertTriangle, Info, DollarSign, Percent, Calendar } from 'lucide-react';

interface SimulationFormProps {
  pool: Pool | null;
  onSimulate: (result: SimulationResult) => void;
}

export function SimulationForm({ pool, onSimulate }: SimulationFormProps) {
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [lowerPrice, setLowerPrice] = useState<string>('');
  const [upperPrice, setUpperPrice] = useState<string>('');
  const [days, setDays] = useState<string>('30');
  const [isSimulating, setIsSimulating] = useState(false);

  const currentPrice = pool ? (pool.token0.price || 1) / (pool.token1.price || 1) : 0;

  useEffect(() => {
    if (pool && currentPrice > 0) {
      // Set default range to -10% to +10% of current price
      setLowerPrice((currentPrice * 0.9).toFixed(4));
      setUpperPrice((currentPrice * 1.1).toFixed(4));
    }
  }, [pool, currentPrice]);

  const handleSimulate = async () => {
    if (!pool) return;

    setIsSimulating(true);

    // Simulate calculation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const deposit = parseFloat(depositAmount) || 0;
    const lower = parseFloat(lowerPrice) || 0;
    const upper = parseFloat(upperPrice) || 0;
    const numDays = parseInt(days) || 30;

    // Calculate estimated returns based on pool APR
    const dailyRate = pool.apr / 365 / 100;
    const inRange = currentPrice >= lower && currentPrice <= upper;
    const rangeWidth = (upper - lower) / currentPrice;
    const concentrationFactor = 1 / rangeWidth; // Higher concentration = higher returns but more IL risk

    // Estimate time in range (simplified model)
    const volatility = 0.3; // Assume 30% annual volatility
    const dailyVol = volatility / Math.sqrt(365);
    const rangeStdDevs = rangeWidth / (2 * dailyVol);
    const timeInRange = Math.min(0.95, 0.5 + 0.4 * Math.tanh(rangeStdDevs - 1));

    // Calculate fees earned
    const baseFees = deposit * dailyRate * numDays;
    const adjustedFees = baseFees * concentrationFactor * timeInRange;

    // Calculate impermanent loss (simplified)
    const priceChange = 1 + (Math.random() - 0.5) * 0.2; // Random price change for simulation
    const il = calculateImpermanentLoss(priceChange);
    const ilDollar = deposit * Math.abs(il);

    // Generate daily fees array
    const dailyFees = Array.from({ length: numDays }, () => {
      const dayFee = (adjustedFees / numDays) * (0.8 + Math.random() * 0.4);
      return dayFee;
    });

    const result: SimulationResult = {
      estimatedFees: adjustedFees,
      estimatedAPR: (adjustedFees / deposit) * (365 / numDays) * 100,
      impermanentLoss: ilDollar,
      netReturn: adjustedFees - ilDollar,
      token0Amount: deposit / 2 / (pool.token0.price || 1),
      token1Amount: deposit / 2 / (pool.token1.price || 1),
      inRange,
      timeInRange: timeInRange * 100,
      dailyFees,
    };

    onSimulate(result);
    setIsSimulating(false);
  };

  const setQuickRange = (percentage: number) => {
    if (currentPrice > 0) {
      setLowerPrice((currentPrice * (1 - percentage / 100)).toFixed(4));
      setUpperPrice((currentPrice * (1 + percentage / 100)).toFixed(4));
    }
  };

  if (!pool) {
    return (
      <Card className="p-8 text-center">
        <Calculator className="w-12 h-12 text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Select a Pool to Simulate</h3>
        <p className="text-sm text-muted">
          Choose a liquidity pool from the Discover page to start simulating returns
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <TokenIcon symbol={pool.token0.symbol} />
              <TokenIcon symbol={pool.token1.symbol} />
            </div>
            <div>
              <h3 className="font-semibold">
                {pool.token0.symbol}/{pool.token1.symbol}
              </h3>
              <span className="text-xs text-muted">{pool.feeTier / 10000}% fee tier</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">Current Price</p>
            <p className="font-medium">{formatNumber(currentPrice, 4)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Deposit Amount */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <DollarSign className="w-4 h-4 text-muted" />
            Deposit Amount (USD)
          </label>
          <Input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <div className="flex gap-2 mt-2">
            {[100, 500, 1000, 5000, 10000].map((amount) => (
              <button
                key={amount}
                onClick={() => setDepositAmount(amount.toString())}
                className="px-2 py-1 text-xs bg-card-hover rounded hover:bg-primary/20 transition-colors"
              >
                ${formatNumber(amount, 0)}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Percent className="w-4 h-4 text-muted" />
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted block mb-1">Min Price</span>
              <Input
                type="number"
                value={lowerPrice}
                onChange={(e) => setLowerPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <span className="text-xs text-muted block mb-1">Max Price</span>
              <Input
                type="number"
                value={upperPrice}
                onChange={(e) => setUpperPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            {[5, 10, 25, 50, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setQuickRange(pct)}
                className="px-2 py-1 text-xs bg-card-hover rounded hover:bg-primary/20 transition-colors"
              >
                ±{pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Period */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 text-muted" />
            Simulation Period (Days)
          </label>
          <Input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="30"
          />
          <div className="flex gap-2 mt-2">
            {[7, 14, 30, 90, 180, 365].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d.toString())}
                className="px-2 py-1 text-xs bg-card-hover rounded hover:bg-primary/20 transition-colors"
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Pool Stats */}
        <div className="bg-background rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-muted" />
            Pool Statistics
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted">TVL</span>
              <span className="float-right">{formatCurrency(pool.tvl, true)}</span>
            </div>
            <div>
              <span className="text-muted">24h Volume</span>
              <span className="float-right">{formatCurrency(pool.volume24h, true)}</span>
            </div>
            <div>
              <span className="text-muted">24h Fees</span>
              <span className="float-right">{formatCurrency(pool.fees24h, true)}</span>
            </div>
            <div>
              <span className="text-muted">Current APR</span>
              <span className="float-right text-success">{formatPercent(pool.apr, false)}</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warning">
            This simulation is for educational purposes only. Actual returns may vary significantly due to market conditions, impermanent loss, and other factors.
          </p>
        </div>

        {/* Simulate Button */}
        <Button
          onClick={handleSimulate}
          disabled={isSimulating || !depositAmount || !lowerPrice || !upperPrice}
          className="w-full"
          size="lg"
        >
          {isSimulating ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Simulating...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Run Simulation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function TokenIcon({ symbol }: { symbol: string }) {
  const colors: Record<string, string> = {
    ETH: '#627eea',
    WETH: '#627eea',
    USDC: '#2775ca',
    USDT: '#26a17b',
    WBTC: '#f7931a',
    DAI: '#f5ac37',
    LINK: '#2a5ada',
    UNI: '#ff007a',
  };

  const color = colors[symbol] || '#6366f1';

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-card"
      style={{ backgroundColor: color }}
    >
      {symbol.charAt(0)}
    </div>
  );
}
