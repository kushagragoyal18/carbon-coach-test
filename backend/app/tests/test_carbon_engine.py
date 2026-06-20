import pytest
from app.carbon_engine.engine import (
    calculate_transport_emissions,
    calculate_diet_emissions,
    calculate_energy_emissions,
    run_carbon_engine,
    EMISSION_FACTORS
)

def test_calculate_transport_emissions():
    # Test gasoline car calculation
    emissions, trace = calculate_transport_emissions("gasoline_car", 100.0)
    assert emissions == 20.0
    assert "100.0 km" in trace
    assert "0.20 kg CO2/km" in trace
    assert "20.00 kg" in trace
    
    # Test active (walking/cycling) calculation
    emissions, trace = calculate_transport_emissions("active", 50.0)
    assert emissions == 0.0
    
    # Test ev car calculation
    emissions, trace = calculate_transport_emissions("ev_car", 200.0)
    assert emissions == 10.0  # 200 * 0.05
    
    # Test unknown transport mode (defaults to gasoline factor)
    emissions, trace = calculate_transport_emissions("rocket", 10.0)
    assert emissions == 2.0  # 10 * 0.20

def test_calculate_diet_emissions():
    # Test 5 meat meals, 2 veg meals, 0 vegan meals
    emissions, trace = calculate_diet_emissions(5, 2, 0)
    # 5 * 2.5 + 2 * 0.8 = 12.5 + 1.6 = 14.1
    assert abs(emissions - 14.1) < 0.01
    assert "5 meat meals" in trace
    
    # Test all zero meals
    emissions, trace = calculate_diet_emissions(0, 0, 0)
    assert emissions == 0.0

def test_calculate_energy_emissions():
    # Test 100 kWh
    emissions, trace = calculate_energy_emissions(100.0)
    assert emissions == 45.0
    
    # Test 0 kWh
    emissions, trace = calculate_energy_emissions(0.0)
    assert emissions == 0.0

def test_run_carbon_engine():
    profile = {
        "transport_mode": "hybrid_car",
        "transport_distance_weekly": 150.0,  # 150 * 0.1 = 15.0
        "meals_meat_weekly": 4,              # 4 * 2.5 = 10.0
        "meals_veg_weekly": 3,               # 3 * 0.8 = 2.4
        "meals_vegan_weekly": 7,             # 7 * 0.5 = 3.5
        "home_energy_kwh_weekly": 20.0       # 20 * 0.45 = 9.0
    }
    # Total expected: 15.0 + 10.0 + 2.4 + 3.5 + 9.0 = 39.9
    result = run_carbon_engine(profile)
    
    assert result["emissions"]["transport"] == 15.0
    assert result["emissions"]["diet"] == 15.9  # 10.0 + 2.4 + 3.5
    assert result["emissions"]["energy"] == 9.0
    assert result["emissions"]["total"] == 39.9
    
    assert len(result["math_trace"]) == 4
    assert "Total Weekly Footprint:" in result["math_trace"][-1]
    
    # Check percentage vs benchmark of 60.0
    # (39.9 - 60.0) / 60.0 = -20.1 / 60 = -33.5%
    assert result["benchmarks"]["percentage_vs_benchmark"] == -33.5
