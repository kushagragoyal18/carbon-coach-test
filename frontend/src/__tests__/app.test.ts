/**
 * Frontend tests — store logic, API contract types, and accessibility checks.
 */

import { describe, it, expect } from 'vitest';

// ---- Store defaults ----

describe('Store default values', () => {
  it('exports a Zustand store with expected shape', async () => {
    const { useStore } = await import('../store');
    const state = useStore.getState();

    expect(state.profile).toBeDefined();
    expect(state.profile.transport_mode).toBe('gasoline_car');
    expect(state.profile.transport_distance_weekly).toBe(100);
    expect(state.profile.meals_meat_weekly).toBe(5);
    expect(state.hasCalculated).toBe(false);
    expect(state.emissions).toBeNull();
    expect(state.insights).toBeNull();
    expect(state.activeTab).toBe('dashboard');
  });

  it('setProfile updates partial profile', async () => {
    const { useStore } = await import('../store');
    useStore.getState().setProfile({ transport_mode: 'subway' });
    expect(useStore.getState().profile.transport_mode).toBe('subway');
    // Reset for other tests
    useStore.getState().setProfile({ transport_mode: 'gasoline_car' });
  });

  it('setActiveTab changes the active tab', async () => {
    const { useStore } = await import('../store');
    useStore.getState().setActiveTab('simulator');
    expect(useStore.getState().activeTab).toBe('simulator');
    useStore.getState().setActiveTab('dashboard');
  });

  it('applyPreset updates altProfile', async () => {
    const { useStore } = await import('../store');
    useStore.getState().applyPreset({ transport_mode: 'active' });
    expect(useStore.getState().altProfile.transport_mode).toBe('active');
  });
});

// ---- API client types ----

describe('API client exports', () => {
  it('api object has all expected methods', async () => {
    const { api } = await import('../api');
    expect(typeof api.health).toBe('function');
    expect(typeof api.calculate).toBe('function');
    expect(typeof api.insights).toBe('function');
    expect(typeof api.whatIf).toBe('function');
    expect(typeof api.roadmap).toBe('function');
  });
});

// ---- CommuterProfile validation ----

describe('CommuterProfile structure', () => {
  it('default profile has all required fields', async () => {
    const { useStore } = await import('../store');
    const { profile } = useStore.getState();

    const requiredKeys = [
      'transport_mode',
      'transport_distance_weekly',
      'meals_meat_weekly',
      'meals_veg_weekly',
      'meals_vegan_weekly',
      'home_energy_kwh_weekly',
    ];
    for (const key of requiredKeys) {
      expect(profile).toHaveProperty(key);
    }
  });

  it('numeric fields are within expected bounds', async () => {
    const { useStore } = await import('../store');
    const { profile } = useStore.getState();

    expect(profile.transport_distance_weekly).toBeGreaterThanOrEqual(0);
    expect(profile.transport_distance_weekly).toBeLessThanOrEqual(5000);
    expect(profile.meals_meat_weekly).toBeGreaterThanOrEqual(0);
    expect(profile.meals_meat_weekly).toBeLessThanOrEqual(21);
    expect(profile.home_energy_kwh_weekly).toBeGreaterThanOrEqual(0);
  });
});
