/**
 * WhatIfSimulator — Side-by-side comparison with presets and live delta.
 */

import { useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  ArrowRight, TrainFront, Loader2, Zap,
  Car, Bus, Bike, Fuel, CircleGauge
} from 'lucide-react';
import { useStore } from '../store';

const PRESETS = [
  { label: '🚇 Switch to Subway', preset: { transport_mode: 'subway' } },
  { label: '🚌 Take the Bus', preset: { transport_mode: 'bus' } },
  { label: '🚲 Walk/Cycle', preset: { transport_mode: 'active' } },
  { label: '🥗 Go Vegetarian', preset: { meals_meat_weekly: 0, meals_veg_weekly: 7, meals_vegan_weekly: 0 } },
  { label: '🌱 Go Vegan', preset: { meals_meat_weekly: 0, meals_veg_weekly: 0, meals_vegan_weekly: 7 } },
  { label: '⚡ Halve Energy', preset: { home_energy_kwh_weekly: 10 } },
];

const TRANSPORT_OPTIONS = [
  { value: 'gasoline_car', label: 'Gas Car', icon: <Car size={16} /> },
  { value: 'diesel_car', label: 'Diesel', icon: <Fuel size={16} /> },
  { value: 'hybrid_car', label: 'Hybrid', icon: <CircleGauge size={16} /> },
  { value: 'ev_car', label: 'EV', icon: <Zap size={16} /> },
  { value: 'bus', label: 'Bus', icon: <Bus size={16} /> },
  { value: 'subway', label: 'Subway', icon: <TrainFront size={16} /> },
  { value: 'train', label: 'Train', icon: <TrainFront size={16} /> },
  { value: 'active', label: 'Walk/Cycle', icon: <Bike size={16} /> },
];

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#f1f5f9',
  fontSize: '13px',
};

export default function WhatIfSimulator() {
  const {
    altProfile, setAltProfile, applyPreset,
    whatIf, isLoadingWhatIf, runWhatIf,
    profile,
  } = useStore();

  // Auto-run comparison on first mount
  useEffect(() => {
    if (!whatIf) runWhatIf();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const barData = whatIf ? [
    { category: 'Transport', current: whatIf.current.emissions.transport, alternate: whatIf.alternate.emissions.transport },
    { category: 'Diet', current: whatIf.current.emissions.diet, alternate: whatIf.alternate.emissions.diet },
    { category: 'Energy', current: whatIf.current.emissions.energy, alternate: whatIf.alternate.emissions.energy },
    { category: 'Total', current: whatIf.current.emissions.total, alternate: whatIf.alternate.emissions.total },
  ] : [];

  return (
    <div id="panel-simulator" role="tabpanel" aria-labelledby="tab-simulator">
      <div className="section-header">
        <h2 className="section-header__title">🔄 What-If Simulator</h2>
        <p className="section-header__subtitle">
          See how changing your habits could reduce your footprint
        </p>
      </div>

      {/* Quick Presets */}
      <div className="preset-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            className="preset-btn"
            onClick={() => {
              applyPreset(p.preset);
              // Trigger recalculation after a short delay for state update
              setTimeout(() => runWhatIf(), 50);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="simulator-layout">
        {/* Current Profile (read-only summary) */}
        <div className="simulator-panel">
          <h3 className="simulator-panel__title" style={{ color: 'var(--color-text-secondary)' }}>
            📍 Current
          </h3>
          <div className="form-group">
            <span className="form-label">Mode</span>
            <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {profile.transport_mode.replace('_', ' ')}
            </div>
          </div>
          <div className="form-group">
            <span className="form-label">Distance</span>
            <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {profile.transport_distance_weekly} km/week
            </div>
          </div>
          <div className="form-group">
            <span className="form-label">Diet</span>
            <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {profile.meals_meat_weekly}🥩 {profile.meals_veg_weekly}🥗 {profile.meals_vegan_weekly}🌱
            </div>
          </div>
          <div className="form-group">
            <span className="form-label">Energy</span>
            <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {profile.home_energy_kwh_weekly} kWh
            </div>
          </div>

          {whatIf && (
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'rgba(244,63,94,0.08)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-coral)' }}>
                {whatIf.current.emissions.total.toFixed(1)}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                kg CO₂/week
              </div>
            </div>
          )}
        </div>

        {/* Delta Indicator */}
        <div className="simulator-delta">
          <div className="delta-arrow">
            <ArrowRight size={32} />
          </div>
          {whatIf && (
            <>
              <div className={`delta-value ${whatIf.delta_total >= 0 ? 'delta-value--positive' : 'delta-value--negative'}`}>
                {whatIf.delta_total >= 0 ? '−' : '+'}{Math.abs(whatIf.delta_total).toFixed(1)}
              </div>
              <div className="delta-label">kg CO₂ saved/week</div>
            </>
          )}
          {isLoadingWhatIf && <Loader2 size={24} className="loading-spinner" />}
        </div>

        {/* Alternate Profile (editable) */}
        <div className="simulator-panel">
          <h3 className="simulator-panel__title" style={{ color: 'var(--color-emerald)' }}>
            ✨ What If...
          </h3>

          <div className="form-group">
            <label className="form-label">Transport Mode</label>
            <select
              className="form-select"
              value={altProfile.transport_mode}
              onChange={(e) => setAltProfile({ transport_mode: e.target.value })}
            >
              {TRANSPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Distance (km/week)</label>
            <input
              type="range"
              className="form-slider"
              min={0} max={500} step={5}
              value={altProfile.transport_distance_weekly}
              onChange={(e) => setAltProfile({ transport_distance_weekly: Number(e.target.value) })}
            />
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-emerald)', fontWeight: 600 }}>
              {altProfile.transport_distance_weekly} km
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Meat / Veg / Vegan meals</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input type="number" className="form-input" min={0} max={21} value={altProfile.meals_meat_weekly}
                onChange={(e) => setAltProfile({ meals_meat_weekly: Number(e.target.value) })}
                style={{ width: '33%' }} />
              <input type="number" className="form-input" min={0} max={21} value={altProfile.meals_veg_weekly}
                onChange={(e) => setAltProfile({ meals_veg_weekly: Number(e.target.value) })}
                style={{ width: '33%' }} />
              <input type="number" className="form-input" min={0} max={21} value={altProfile.meals_vegan_weekly}
                onChange={(e) => setAltProfile({ meals_vegan_weekly: Number(e.target.value) })}
                style={{ width: '33%' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Energy (kWh)</label>
            <input
              type="range"
              className="form-slider"
              min={0} max={100} step={1}
              value={altProfile.home_energy_kwh_weekly}
              onChange={(e) => setAltProfile({ home_energy_kwh_weekly: Number(e.target.value) })}
            />
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-emerald)', fontWeight: 600 }}>
              {altProfile.home_energy_kwh_weekly} kWh
            </div>
          </div>

          <button
            className="btn btn--primary btn--full"
            onClick={runWhatIf}
            disabled={isLoadingWhatIf}
          >
            {isLoadingWhatIf ? <Loader2 size={16} className="loading-spinner" /> : <Zap size={16} />}
            Compare
          </button>

          {whatIf && (
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--color-emerald-glow)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-emerald)' }}>
                {whatIf.alternate.emissions.total.toFixed(1)}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                kg CO₂/week
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Chart */}
      {whatIf && (
        <div className="chart-card animate-fade-in" style={{ marginTop: 'var(--space-6)' }}>
          <h3 className="chart-card__title">Side-by-Side Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} barCategoryGap="25%">
              <XAxis
                dataKey="category"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                unit=" kg"
              />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(val: number) => `${val.toFixed(1)} kg`} />
              <Bar dataKey="current" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Current" />
              <Bar dataKey="alternate" fill="#10b981" radius={[4, 4, 0, 0]} name="What If" />
              <Legend wrapperStyle={{ fontSize: '13px', color: '#94a3b8' }} iconType="circle" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
