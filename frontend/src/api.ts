/**
 * CarbonCoach API Client
 * Typed fetch wrapper with device UUID and error handling.
 */

// ---- Types ----

export interface CommuterProfile {
  transport_mode: string;
  transport_distance_weekly: number;
  meals_meat_weekly: number;
  meals_veg_weekly: number;
  meals_vegan_weekly: number;
  home_energy_kwh_weekly: number;
}

export interface EmissionsBreakdown {
  transport: number;
  diet: number;
  energy: number;
  total: number;
}

export interface BenchmarkData {
  transport: number;
  diet: number;
  energy: number;
  total: number;
  percentage_vs_benchmark: number;
}

export interface CalculateResponse {
  emissions: EmissionsBreakdown;
  benchmarks: BenchmarkData;
  math_trace: string[];
}

export interface RecommendationItem {
  title: string;
  impact_kg: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  action: string;
}

export interface InsightsResponse {
  headline: string;
  assessment: string;
  comparison_vs_benchmark: string;
  top_recommendations: RecommendationItem[];
}

export interface WhatIfRequest {
  current: CommuterProfile;
  alternate: CommuterProfile;
}

export interface WhatIfComparison {
  current: CalculateResponse;
  alternate: CalculateResponse;
  delta_total: number;
  delta_transport: number;
  delta_diet: number;
  delta_energy: number;
}

export interface RoadmapMilestone {
  day_range: string;
  title: string;
  description: string;
  difficulty: string;
  expected_impact_kg: number;
  tasks: string[];
}

export interface RoadmapPhase {
  phase_number: number;
  phase_name: string;
  day_range: string;
  milestones: RoadmapMilestone[];
}

export interface RoadmapResponse {
  emission_level: string;
  total_potential_reduction_kg: number;
  phases: RoadmapPhase[];
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  gemini_available: boolean;
}

// ---- Device UUID ----

const UUID_KEY = 'carboncoach_device_uuid';

function getDeviceUUID(): string {
  let uuid = localStorage.getItem(UUID_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(UUID_KEY, uuid);
  }
  return uuid;
}

// ---- Base Fetch ----

const BASE_URL = '/api';
const API_UNAVAILABLE_MESSAGE =
  'Unable to reach the CarbonCoach API. Make sure the backend is running and try again.';

async function getApiErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => null);
    if (typeof body?.detail === 'string') return body.detail;
    if (Array.isArray(body?.detail)) {
      return body.detail
        .map((item: unknown) => {
          if (
            typeof item === 'object' &&
            item !== null &&
            'msg' in item &&
            typeof item.msg === 'string'
          ) {
            return item.msg;
          }
          return JSON.stringify(item);
        })
        .join('; ');
    }
    if (typeof body?.message === 'string') return body.message;
  }

  const text = await response.text().catch(() => 'Unknown error');
  return text.length > 240 ? `${text.slice(0, 240)}...` : text;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Device-UUID': getDeviceUUID(),
    ...(options.headers as Record<string, string> || {}),
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(API_UNAVAILABLE_MESSAGE);
  }

  if (!response.ok) {
    const errorBody = await getApiErrorMessage(response);
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

// ---- API Methods ----

export const api = {
  health(): Promise<HealthResponse> {
    return apiFetch<HealthResponse>('/health');
  },

  calculate(profile: CommuterProfile): Promise<CalculateResponse> {
    return apiFetch<CalculateResponse>('/calculate', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  insights(profile: CommuterProfile): Promise<InsightsResponse> {
    return apiFetch<InsightsResponse>('/insights', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  whatIf(scenario: WhatIfRequest): Promise<WhatIfComparison> {
    return apiFetch<WhatIfComparison>('/what-if', {
      method: 'POST',
      body: JSON.stringify(scenario),
    });
  },

  roadmap(emissionLevel: string): Promise<RoadmapResponse> {
    return apiFetch<RoadmapResponse>(`/roadmap?emission_level=${encodeURIComponent(emissionLevel)}`);
  },
};
