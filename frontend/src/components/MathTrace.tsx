/**
 * MathTrace — "Show the Math" transparency panel with terminal-style calculation display.
 */

import { useStore } from '../store';
import { Calculator } from 'lucide-react';

export default function MathTrace() {
  const { emissions } = useStore();

  if (!emissions) return null;

  const { math_trace } = emissions;

  return (
    <div id="panel-math" role="tabpanel" aria-labelledby="tab-math">
      <div className="section-header">
        <h2 className="section-header__title">
          <Calculator size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Show the Math
        </h2>
        <p className="section-header__subtitle">
          Complete transparency — here's exactly how we calculated your footprint
        </p>
      </div>

      <div className="math-trace animate-slide-up">
        {math_trace.map((line, index) => (
          <div
            key={index}
            className="math-trace__line"
          >
            <span className="math-trace__index">{index + 1}.</span>
            <span className={`math-trace__content ${
              index === math_trace.length - 1 ? 'math-trace__content--highlight' : ''
            }`}>
              {line}
            </span>
          </div>
        ))}
      </div>

      {/* Emission Factors Reference */}
      <div className="glass-card animate-fade-in" style={{ marginTop: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          📐 Emission Factors Reference
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
          {/* Transport */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', color: '#3b82f6', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Transport (kg CO₂/km)
            </h4>
            {[
              ['Gasoline Car', '0.20'],
              ['Diesel Car', '0.18'],
              ['Motorcycle', '0.12'],
              ['Hybrid Car', '0.10'],
              ['Bus', '0.08'],
              ['EV Car', '0.05'],
              ['Subway', '0.04'],
              ['Train', '0.03'],
              ['Walk/Cycle', '0.00'],
            ].map(([mode, factor]) => (
              <div key={mode} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                padding: 'var(--space-1) 0',
                borderBottom: '1px solid rgba(148,163,184,0.06)',
              }}>
                <span>{mode}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{factor}</span>
              </div>
            ))}
          </div>

          {/* Diet */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', color: '#f59e0b', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Diet (kg CO₂/meal)
            </h4>
            {[
              ['Meat', '2.50'],
              ['Vegetarian', '0.80'],
              ['Vegan', '0.50'],
            ].map(([type, factor]) => (
              <div key={type} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                padding: 'var(--space-1) 0',
                borderBottom: '1px solid rgba(148,163,184,0.06)',
              }}>
                <span>{type}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{factor}</span>
              </div>
            ))}
          </div>

          {/* Energy */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', color: '#8b5cf6', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Energy (kg CO₂/kWh)
            </h4>
            {[
              ['Electricity', '0.45'],
            ].map(([type, factor]) => (
              <div key={type} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                padding: 'var(--space-1) 0',
                borderBottom: '1px solid rgba(148,163,184,0.06)',
              }}>
                <span>{type}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{
          marginTop: 'var(--space-4)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
        }}>
          Factors sourced from DEFRA, EPA, and IEA public databases. Regional average commuter benchmark: 60.0 kg CO₂/week.
        </p>
      </div>
    </div>
  );
}
