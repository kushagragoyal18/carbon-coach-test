# Carbon Engine - Pure functions with no I/O

# Standard emission factors (kg CO2 per unit)
EMISSION_FACTORS = {
    "transport": {
        "gasoline_car": 0.20,      # kg CO2/km
        "diesel_car": 0.18,        # kg CO2/km
        "hybrid_car": 0.10,        # kg CO2/km
        "ev_car": 0.05,            # kg CO2/km (depends on grid, standard estimation)
        "motorcycle": 0.12,        # kg CO2/km
        "bus": 0.08,               # kg CO2/passenger-km
        "subway": 0.04,            # kg CO2/passenger-km
        "train": 0.03,             # kg CO2/passenger-km
        "active": 0.0              # Walking/cycling
    },
    "diet": {
        "meat": 2.5,               # kg CO2/meal (red/white meat average)
        "vegetarian": 0.8,         # kg CO2/meal
        "vegan": 0.5               # kg CO2/meal
    },
    "energy": {
        "electricity_kwh": 0.45    # kg CO2/kWh
    }
}

# Regional average commuter benchmark (kg CO2 / week)
COMMUTER_BENCHMARK = {
    "total": 60.0,
    "transport": 35.0,
    "diet": 15.0,
    "energy": 10.0
}

def calculate_transport_emissions(mode: str, distance_km: float) -> tuple[float, str]:
    """Calculate weekly transport emissions and return (emissions_kg, trace)."""
    factor = EMISSION_FACTORS["transport"].get(mode, 0.20)
    emissions = distance_km * factor
    trace = f"Transport: {distance_km:.1f} km * {factor:.2f} kg CO2/km ({mode}) = {emissions:.2f} kg CO2/week"
    return round(emissions, 2), trace

def calculate_diet_emissions(meat_meals: int, veg_meals: int, vegan_meals: int) -> tuple[float, str]:
    """Calculate weekly diet emissions and return (emissions_kg, trace)."""
    meat_f = EMISSION_FACTORS["diet"]["meat"]
    veg_f = EMISSION_FACTORS["diet"]["vegetarian"]
    vegan_f = EMISSION_FACTORS["diet"]["vegan"]
    
    meat_emissions = meat_meals * meat_f
    veg_emissions = veg_meals * veg_f
    vegan_emissions = vegan_meals * vegan_f
    
    total = meat_emissions + veg_emissions + vegan_emissions
    
    trace = (
        f"Diet: ({meat_meals} meat meals * {meat_f:.1f} kg) + "
        f"({veg_meals} veg meals * {veg_f:.1f} kg) + "
        f"({vegan_meals} vegan meals * {vegan_f:.1f} kg) = {total:.2f} kg CO2/week"
    )
    return round(total, 2), trace

def calculate_energy_emissions(kwh: float) -> tuple[float, str]:
    """Calculate weekly home/office energy emissions and return (emissions_kg, trace)."""
    factor = EMISSION_FACTORS["energy"]["electricity_kwh"]
    emissions = kwh * factor
    trace = f"Energy: {kwh:.1f} kWh * {factor:.2f} kg CO2/kWh = {emissions:.2f} kg CO2/week"
    return round(emissions, 2), trace

def run_carbon_engine(profile: dict) -> dict:
    """
    Main entry point for pure carbon calculations.
    Accepts:
        profile: {
            "transport_mode": str,
            "transport_distance_weekly": float,
            "meals_meat_weekly": int,
            "meals_veg_weekly": int,
            "meals_vegan_weekly": int,
            "home_energy_kwh_weekly": float
        }
    Returns:
        dictionary with emissions breakdown, total, math trace, and benchmarking vs standard.
    """
    t_mode = profile.get("transport_mode", "gasoline_car")
    t_dist = float(profile.get("transport_distance_weekly", 0.0))
    
    m_meat = int(profile.get("meals_meat_weekly", 0))
    m_veg = int(profile.get("meals_veg_weekly", 0))
    m_vegan = int(profile.get("meals_vegan_weekly", 0))
    
    energy_kwh = float(profile.get("home_energy_kwh_weekly", 0.0))
    
    t_emissions, t_trace = calculate_transport_emissions(t_mode, t_dist)
    d_emissions, d_trace = calculate_diet_emissions(m_meat, m_veg, m_vegan)
    e_emissions, e_trace = calculate_energy_emissions(energy_kwh)
    
    total = t_emissions + d_emissions + e_emissions
    
    # Benchmarking comparisons
    benchmark = COMMUTER_BENCHMARK["total"]
    percentage_vs_benchmark = round(((total - benchmark) / benchmark) * 100.0, 1)
    
    return {
        "emissions": {
            "transport": round(t_emissions, 2),
            "diet": round(d_emissions, 2),
            "energy": round(e_emissions, 2),
            "total": round(total, 2)
        },
        "benchmarks": {
            "transport": COMMUTER_BENCHMARK["transport"],
            "diet": COMMUTER_BENCHMARK["diet"],
            "energy": COMMUTER_BENCHMARK["energy"],
            "total": benchmark,
            "percentage_vs_benchmark": percentage_vs_benchmark
        },
        "math_trace": [
            t_trace,
            d_trace,
            e_trace,
            f"Total Weekly Footprint: Transport ({t_emissions:.2f} kg) + Diet ({d_emissions:.2f} kg) + Energy ({e_emissions:.2f} kg) = {total:.2f} kg CO2"
        ]
    }
