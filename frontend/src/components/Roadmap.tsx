/**
 * Roadmap — 90-day carbon reduction timeline with 3 phases and expandable milestones.
 */

import { useEffect } from 'react';
import { Loader2, Leaf, TrendingDown } from 'lucide-react';
import { useStore } from '../store';

export default function Roadmap() {
  const { roadmap, isLoadingRoadmap, fetchRoadmap } = useStore();

  useEffect(() => {
    if (!roadmap) fetchRoadmap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id="panel-roadmap" role="tabpanel" aria-labelledby="tab-roadmap">
      <div className="section-header">
        <h2 className="section-header__title">🗺️ 90-Day Reduction Roadmap</h2>
        <p className="section-header__subtitle">
          Your personalized step-by-step plan from quick wins to advanced optimizations
        </p>
      </div>

      {isLoadingRoadmap ? (
        <div className="loading-overlay">
          <Loader2 size={24} className="loading-spinner" />
          <span>Building your roadmap...</span>
        </div>
      ) : roadmap ? (
        <>
          {/* Summary */}
          <div className="stat-grid animate-stagger" style={{ marginBottom: 'var(--space-8)' }}>
            <div className="stat-card">
              <div className="stat-card__value">{roadmap.emission_level}</div>
              <div className="stat-card__label">Emission Tier</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{roadmap.total_potential_reduction_kg}</div>
              <div className="stat-card__label">kg CO₂ Potential Reduction</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{roadmap.phases.length}</div>
              <div className="stat-card__label">Phases</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">
                {roadmap.phases.reduce((sum, p) => sum + p.milestones.length, 0)}
              </div>
              <div className="stat-card__label">Milestones</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="roadmap-timeline animate-slide-up">
            {roadmap.phases.map((phase) => (
              <div key={phase.phase_number} className="phase-section">
                {/* Phase Header */}
                <div className="phase-header">
                  <div className={`phase-dot phase-dot--${phase.phase_number}`}>
                    {phase.phase_number}
                  </div>
                  <div>
                    <h3 className="phase-title">{phase.phase_name}</h3>
                    <span className="phase-days">{phase.day_range}</span>
                  </div>
                </div>

                {/* Milestones */}
                {phase.milestones.map((milestone, mIdx) => (
                  <div key={mIdx} className="milestone-card">
                    <div className="milestone-card__header">
                      <h4 className="milestone-card__title">{milestone.title}</h4>
                      <span className="milestone-card__days">{milestone.day_range}</span>
                    </div>
                    <p className="milestone-card__description">{milestone.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span className="milestone-card__impact">
                        <TrendingDown size={12} />
                        {milestone.expected_impact_kg} kg CO₂/week
                      </span>
                      <span className={`recommendation-card__badge badge--${milestone.difficulty.toLowerCase()}`}>
                        {milestone.difficulty}
                      </span>
                    </div>
                    <ul className="milestone-tasks">
                      {milestone.tasks.map((task, tIdx) => (
                        <li key={tIdx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
            <Leaf size={32} color="#10b981" style={{ marginBottom: 'var(--space-2)' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Every small step counts. Start with Phase 1 and build momentum!
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
