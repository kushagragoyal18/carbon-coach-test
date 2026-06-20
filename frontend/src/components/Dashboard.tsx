/**
 * Dashboard — Hero stats, Recharts pie/bar charts, and AI insight cards.
 */

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, Loader2 } from 'lucide-react';
import { useStore } from '../store';

const COLORS = {
  transport: '#3b82f6',
  diet: '#f59e0b',
  energy: '#8b5cf6',
  benchmark: '#334155',
};

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#f1f5f9',
  fontSize: '13px',
};

export default function Dashboard() {
  const { emissions, insights, isLoadingInsights } = useStore();

  if (!emissions) return null;

  const { emissions: em, benchmarks: bm } = emissions;

  // Pie data
  const pieData = [
    { name: 'Transport', value: em.transport, color: COLORS.transport },
    { name: 'Diet', value: em.diet, color: COLORS.diet },
    { name: 'Energy', value: em.energy, color: COLORS.energy },
  ];

  // Bar comparison data
  const barData = [
    { category: 'Transport', yours: em.transport, average: bm.transport },
    { category: 'Diet', yours: em.diet, average: bm.diet },
    { category: 'Energy', yours: em.energy, average: bm.energy },
    { category: 'Total', yours: em.total, average: bm.total },
  ];

  // Benchmark icon
  const BenchIcon = bm.percentage_vs_benchmark > 5
    ? TrendingUp
    : bm.percentage_vs_benchmark < -5
      ? TrendingDown
      : Minus;

  const benchColor = bm.percentage_vs_benchmark > 5
    ? 'var(--color-coral)'
    : bm.percentage_vs_benchmark < -5
      ? 'var(--color-emerald)'
      : 'var(--color-amber)';

  return (
    <div id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
      {/* Stat Cards */}
      <div className="stat-grid animate-stagger">
        <div className="stat-card">
          <div className={`stat-card__value ${em.total > 60 ? 'stat-card__value--warning' : ''}`}>
            {em.total.toFixed(1)}
          </div>
          <div className="stat-card__label">kg CO₂ / week</div>
          <div className="stat-card__sub">Total Footprint</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{em.transport.toFixed(1)}</div>
          <div className="stat-card__label" style={{ color: COLORS.transport }}>Transport</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{em.diet.toFixed(1)}</div>
          <div className="stat-card__label" style={{ color: COLORS.diet }}>Diet</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{em.energy.toFixed(1)}</div>
          <div className="stat-card__label" style={{ color: COLORS.energy }}>Energy</div>
        </div>
      </div>

      {/* Benchmark comparison */}
      <div className="stat-grid animate-stagger" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <BenchIcon size={24} color={benchColor} />
            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: benchColor }}>
              {bm.percentage_vs_benchmark > 0 ? '+' : ''}{bm.percentage_vs_benchmark.toFixed(1)}%
            </span>
          </div>
          <div className="stat-card__label">vs Regional Average (60 kg CO₂/week)</div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid animate-fade-in">
        {/* Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-card__title">Emissions Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(val: number) => `${val.toFixed(1)} kg`} />
              <Legend
                wrapperStyle={{ fontSize: '13px', color: '#94a3b8' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-card__title">You vs Average Commuter</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barCategoryGap="20%">
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
              <Bar dataKey="yours" fill="#10b981" radius={[4, 4, 0, 0]} name="You" />
              <Bar dataKey="average" fill="#334155" radius={[4, 4, 0, 0]} name="Avg Commuter" />
              <Legend wrapperStyle={{ fontSize: '13px', color: '#94a3b8' }} iconType="circle" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="insights-section animate-slide-up">
        <div className="section-header">
          <h2 className="section-header__title">💡 Personalized Insights</h2>
          <p className="section-header__subtitle">AI-powered recommendations tailored to your profile</p>
        </div>

        {isLoadingInsights ? (
          <div className="loading-overlay">
            <Loader2 size={24} className="loading-spinner" />
            <span>Generating insights...</span>
          </div>
        ) : insights ? (
          <>
            <h3 className="insight-headline">{insights.headline}</h3>
            <p className="insight-assessment">{insights.assessment}</p>
            <p className="insight-assessment" style={{ fontWeight: 500, color: 'var(--color-emerald)' }}>
              {insights.comparison_vs_benchmark}
            </p>

            <div className="recommendation-grid animate-stagger">
              {insights.top_recommendations.map((rec, i) => (
                <div key={i} className="recommendation-card">
                  <div className="recommendation-card__header">
                    <span className="recommendation-card__title">{rec.title}</span>
                    <span className={`recommendation-card__badge badge--${rec.difficulty.toLowerCase()}`}>
                      {rec.difficulty}
                    </span>
                  </div>
                  <div className="recommendation-card__impact">
                    ↓ {rec.impact_kg.toFixed(1)} kg CO₂/week
                  </div>
                  <p className="recommendation-card__action">{rec.action}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
