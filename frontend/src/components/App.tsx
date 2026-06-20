/**
 * App — Root layout with sticky header, tab navigation, and animated page transitions.
 */

import { Leaf, BarChart3, GitCompare, Map, Calculator, AlertTriangle } from 'lucide-react';
import { useStore, TabId } from '../store';
import ProfileForm from './ProfileForm';
import Dashboard from './Dashboard';
import WhatIfSimulator from './WhatIfSimulator';
import Roadmap from './Roadmap';
import MathTrace from './MathTrace';
import Footer from './Footer';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
  { id: 'simulator', label: 'Simulator', icon: <GitCompare size={16} /> },
  { id: 'roadmap', label: '90-Day Plan', icon: <Map size={16} /> },
  { id: 'math', label: 'Show Math', icon: <Calculator size={16} /> },
];

export default function App() {
  const { activeTab, setActiveTab, hasCalculated, error } = useStore();

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header" role="banner">
        <div className="app-header__brand">
          <Leaf size={28} color="#10b981" strokeWidth={2.5} />
          <div>
            <span className="app-header__logo">CarbonCoach</span>
            <span className="app-header__tagline"> · Track & Reduce Your Footprint</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="app-main" role="main">
        {/* Profile Form — always visible at top */}
        <ProfileForm />

        {error && (
          <div className="app-error animate-fade-in" role="alert" aria-live="assertive">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation — show after first calculation */}
        {hasCalculated && (
          <nav className="tab-nav animate-fade-in" role="tablist" aria-label="Main navigation">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`tab-nav__btn ${activeTab === tab.id ? 'tab-nav__btn--active' : ''}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {/* Tab Content */}
        {hasCalculated && (
          <div className="animate-fade-in">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'simulator' && <WhatIfSimulator />}
            {activeTab === 'roadmap' && <Roadmap />}
            {activeTab === 'math' && <MathTrace />}
          </div>
        )}

        {/* Welcome state when no calculation done */}
        {!hasCalculated && (
          <div className="welcome-section animate-slide-up">
            <span className="welcome-section__icon">🌿</span>
            <h2 className="welcome-section__title">Ready to Know Your Impact?</h2>
            <p className="welcome-section__desc">
              Fill in your weekly commuter profile above and hit Calculate to see your
              personalized carbon dashboard, AI insights, and reduction roadmap.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
