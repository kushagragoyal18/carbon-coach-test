/**
 * CarbonCoach Zustand Store
 * Central state management for the entire application.
 */

import { create } from 'zustand';
import {
  api,
  CommuterProfile,
  CalculateResponse,
  InsightsResponse,
  WhatIfComparison,
  RoadmapResponse,
} from './api';

// ---- Types ----

export type TabId = 'dashboard' | 'simulator' | 'roadmap' | 'math';

interface AppState {
  // Profile
  profile: CommuterProfile;
  setProfile: (updates: Partial<CommuterProfile>) => void;

  // Results
  emissions: CalculateResponse | null;
  insights: InsightsResponse | null;
  whatIf: WhatIfComparison | null;
  roadmap: RoadmapResponse | null;

  // Alternate profile for simulator
  altProfile: CommuterProfile;
  setAltProfile: (updates: Partial<CommuterProfile>) => void;

  // UI State
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isCalculating: boolean;
  isLoadingInsights: boolean;
  isLoadingWhatIf: boolean;
  isLoadingRoadmap: boolean;
  hasCalculated: boolean;
  error: string | null;

  // Actions
  calculate: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  runWhatIf: () => Promise<void>;
  fetchRoadmap: (level?: string) => Promise<void>;
  applyPreset: (preset: Partial<CommuterProfile>) => void;
}

// Default profile
const defaultProfile: CommuterProfile = {
  transport_mode: 'gasoline_car',
  transport_distance_weekly: 100,
  meals_meat_weekly: 5,
  meals_veg_weekly: 3,
  meals_vegan_weekly: 0,
  home_energy_kwh_weekly: 20,
};

// Default alternate profile (greener version)
const defaultAltProfile: CommuterProfile = {
  transport_mode: 'subway',
  transport_distance_weekly: 100,
  meals_meat_weekly: 2,
  meals_veg_weekly: 4,
  meals_vegan_weekly: 2,
  home_energy_kwh_weekly: 15,
};

// ---- Store ----

export const useStore = create<AppState>((set, get) => ({
  // Profile
  profile: { ...defaultProfile },
  setProfile: (updates) =>
    set((state) => ({ profile: { ...state.profile, ...updates } })),

  // Results
  emissions: null,
  insights: null,
  whatIf: null,
  roadmap: null,

  // Alternate profile
  altProfile: { ...defaultAltProfile },
  setAltProfile: (updates) =>
    set((state) => ({ altProfile: { ...state.altProfile, ...updates } })),

  // UI State
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isCalculating: false,
  isLoadingInsights: false,
  isLoadingWhatIf: false,
  isLoadingRoadmap: false,
  hasCalculated: false,
  error: null,

  // Actions
  calculate: async () => {
    const { profile } = get();
    set({ isCalculating: true, error: null });
    try {
      const result = await api.calculate(profile);
      set({ emissions: result, hasCalculated: true, isCalculating: false });
      // Auto-fetch insights after calculation
      get().fetchInsights();
    } catch (err) {
      set({ isCalculating: false, error: (err as Error).message });
    }
  },

  fetchInsights: async () => {
    const { profile } = get();
    set({ isLoadingInsights: true });
    try {
      const result = await api.insights(profile);
      set({ insights: result, isLoadingInsights: false });
    } catch (err) {
      set({ isLoadingInsights: false, error: (err as Error).message });
    }
  },

  runWhatIf: async () => {
    const { profile, altProfile } = get();
    set({ isLoadingWhatIf: true, error: null });
    try {
      const result = await api.whatIf({ current: profile, alternate: altProfile });
      set({ whatIf: result, isLoadingWhatIf: false });
    } catch (err) {
      set({ isLoadingWhatIf: false, error: (err as Error).message });
    }
  },

  fetchRoadmap: async (level?: string) => {
    set({ isLoadingRoadmap: true, error: null });
    const emissionLevel = level || (() => {
      const total = get().emissions?.emissions.total ?? 40;
      if (total > 60) return 'high';
      if (total > 30) return 'moderate';
      return 'low';
    })();
    try {
      const result = await api.roadmap(emissionLevel);
      set({ roadmap: result, isLoadingRoadmap: false });
    } catch (err) {
      set({ isLoadingRoadmap: false, error: (err as Error).message });
    }
  },

  applyPreset: (preset) => {
    set((state) => ({ altProfile: { ...state.altProfile, ...preset } }));
  },
}));
