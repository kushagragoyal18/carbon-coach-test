/**
 * ProfileForm — Sleek commuter profile input with transport mode cards, sliders, and animated submit.
 */

import {
  Car, Bus, TrainFront, Bike, Zap, Fuel,
  CircleGauge, Utensils, BatteryCharging, Loader2
} from 'lucide-react';
import { useStore } from '../store';

const TRANSPORT_MODES = [
  { value: 'gasoline_car', label: 'Gas Car', icon: <Car size={22} /> },
  { value: 'diesel_car', label: 'Diesel', icon: <Fuel size={22} /> },
  { value: 'hybrid_car', label: 'Hybrid', icon: <CircleGauge size={22} /> },
  { value: 'ev_car', label: 'EV', icon: <Zap size={22} /> },
  { value: 'motorcycle', label: 'Motorbike', icon: <CircleGauge size={22} /> },
  { value: 'bus', label: 'Bus', icon: <Bus size={22} /> },
  { value: 'subway', label: 'Subway', icon: <TrainFront size={22} /> },
  { value: 'train', label: 'Train', icon: <TrainFront size={22} /> },
  { value: 'active', label: 'Walk/Cycle', icon: <Bike size={22} /> },
];

export default function ProfileForm() {
  const { profile, setProfile, calculate, isCalculating } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculate();
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form animate-slide-up" aria-label="Commuter profile form">
      {/* Transport Section */}
      <div className="profile-form__section">
        <h3 className="profile-form__section-title">
          <Car size={20} color="#10b981" />
          Transport
        </h3>

        <div className="form-group">
          <label className="form-label">Primary Commute Mode</label>
          <div className="transport-grid">
            {TRANSPORT_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                id={`transport-${mode.value}`}
                className={`transport-card ${profile.transport_mode === mode.value ? 'transport-card--selected' : ''}`}
                onClick={() => setProfile({ transport_mode: mode.value })}
                aria-pressed={profile.transport_mode === mode.value}
              >
                <span className="transport-card__icon">{mode.icon}</span>
                <span className="transport-card__label">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slider-distance">
            Weekly Commute Distance
          </label>
          <div className="slider-container">
            <div className="slider-value">{profile.transport_distance_weekly} km</div>
            <input
              id="slider-distance"
              type="range"
              className="form-slider"
              min={0}
              max={500}
              step={5}
              value={profile.transport_distance_weekly}
              onChange={(e) => setProfile({ transport_distance_weekly: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Diet Section */}
      <div className="profile-form__section">
        <h3 className="profile-form__section-title">
          <Utensils size={20} color="#f59e0b" />
          Weekly Meals
        </h3>

        <div className="form-group">
          <label className="form-label" htmlFor="slider-meat">
            Meat Meals
          </label>
          <div className="slider-container">
            <div className="slider-value">{profile.meals_meat_weekly}</div>
            <input
              id="slider-meat"
              type="range"
              className="form-slider"
              min={0}
              max={21}
              step={1}
              value={profile.meals_meat_weekly}
              onChange={(e) => setProfile({ meals_meat_weekly: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slider-veg">
            Vegetarian Meals
          </label>
          <div className="slider-container">
            <div className="slider-value">{profile.meals_veg_weekly}</div>
            <input
              id="slider-veg"
              type="range"
              className="form-slider"
              min={0}
              max={21}
              step={1}
              value={profile.meals_veg_weekly}
              onChange={(e) => setProfile({ meals_veg_weekly: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slider-vegan">
            Vegan Meals
          </label>
          <div className="slider-container">
            <div className="slider-value">{profile.meals_vegan_weekly}</div>
            <input
              id="slider-vegan"
              type="range"
              className="form-slider"
              min={0}
              max={21}
              step={1}
              value={profile.meals_vegan_weekly}
              onChange={(e) => setProfile({ meals_vegan_weekly: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Energy in same panel */}
        <h3 className="profile-form__section-title" style={{ marginTop: '1.5rem' }}>
          <BatteryCharging size={20} color="#3b82f6" />
          Energy
        </h3>

        <div className="form-group">
          <label className="form-label" htmlFor="slider-energy">
            Weekly Energy Usage
          </label>
          <div className="slider-container">
            <div className="slider-value">{profile.home_energy_kwh_weekly} kWh</div>
            <input
              id="slider-energy"
              type="range"
              className="form-slider"
              min={0}
              max={100}
              step={1}
              value={profile.home_energy_kwh_weekly}
              onChange={(e) => setProfile({ home_energy_kwh_weekly: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="profile-form__actions">
        <button
          type="submit"
          id="btn-calculate"
          className="btn btn--primary btn--large"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <Loader2 size={18} className="loading-spinner" />
              Calculating...
            </>
          ) : (
            <>
              <Zap size={18} />
              Calculate My Footprint
            </>
          )}
        </button>
      </div>
    </form>
  );
}
