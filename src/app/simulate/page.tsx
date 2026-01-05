'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SimulationForm } from '@/components/simulate/SimulationForm';
import { SimulationResults } from '@/components/simulate/SimulationResults';
import { Pool, SimulationResult } from '@/types';
import { fetchPoolById, fetchPools } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';

function SimulateContent() {
  const searchParams = useSearchParams();
  const poolId = searchParams.get('pool');
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [availablePools, setAvailablePools] = useState<Pool[]>([]);
  const { selectedExchange, selectedNetwork } = useStore();

  useEffect(() => {
    async function loadPool() {
      if (poolId) {
        const pool = await fetchPoolById(poolId);
        setSelectedPool(pool);
      }
    }
    loadPool();
  }, [poolId]);

  useEffect(() => {
    async function loadPools() {
      const pools = await fetchPools(selectedExchange.id, selectedNetwork.id);
      setAvailablePools(pools);
      if (!selectedPool && pools.length > 0) {
        setSelectedPool(pools[0]);
      }
    }
    loadPools();
  }, [selectedExchange.id, selectedNetwork.id, selectedPool]);

  const handlePoolSelect = (pool: Pool) => {
    setSelectedPool(pool);
    setSimulationResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Simulate</h1>
        <p className="text-muted mt-1">
          Simulate your liquidity position returns with our advanced calculator
        </p>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className="flex-1">
          {/* Pool Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Pool</label>
            <div className="flex flex-wrap gap-2">
              {availablePools.map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => handlePoolSelect(pool)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPool?.id === pool.id
                      ? 'bg-primary text-white'
                      : 'bg-card hover:bg-card-hover border border-border'
                  }`}
                >
                  {pool.token0.symbol}/{pool.token1.symbol} ({pool.feeTier / 10000}%)
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SimulationForm pool={selectedPool} onSimulate={setSimulationResult} />
            <SimulationResults result={simulationResult} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimulatePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-6">Loading...</div>}>
      <SimulateContent />
    </Suspense>
  );
}
