# Roadmap Engine - Pure functions with no I/O
# Generates a structured 90-day carbon reduction roadmap for commuters.


def generate_roadmap(emission_level: str) -> dict:
    """
    Generate a 90-day reduction roadmap based on the user's emission tier.

    Args:
        emission_level: "low", "moderate", or "high"

    Returns:
        Dictionary with phases, milestones, and expected impact.
    """
    roadmaps = {
        "high": _high_emission_roadmap(),
        "moderate": _moderate_emission_roadmap(),
        "low": _low_emission_roadmap(),
    }
    roadmap = roadmaps.get(emission_level, roadmaps["moderate"])

    total_reduction = sum(
        m["expected_impact_kg"]
        for phase in roadmap
        for m in phase["milestones"]
    )

    return {
        "emission_level": emission_level,
        "total_potential_reduction_kg": round(total_reduction, 1),
        "phases": roadmap,
    }


def _high_emission_roadmap() -> list[dict]:
    return [
        {
            "phase_number": 1,
            "phase_name": "Quick Wins",
            "day_range": "Day 1–30",
            "milestones": [
                {
                    "day_range": "Day 1–10",
                    "title": "Transit Discovery Week",
                    "description": "Replace 2 solo-car commute days with public transit (bus or subway).",
                    "difficulty": "Easy",
                    "expected_impact_kg": 5.0,
                    "tasks": [
                        "Research bus/subway routes for your commute",
                        "Try the bus on Tuesday and Thursday this week",
                        "Track travel time vs. driving to compare convenience",
                    ],
                },
                {
                    "day_range": "Day 11–20",
                    "title": "Meatless Lunch Challenge",
                    "description": "Switch to vegetarian lunches on weekdays.",
                    "difficulty": "Easy",
                    "expected_impact_kg": 4.0,
                    "tasks": [
                        "Find 5 vegetarian lunch spots or recipes near your office",
                        "Meal-prep veggie lunches on Sundays",
                        "Replace 3 meat lunches with vegetarian options this week",
                    ],
                },
                {
                    "day_range": "Day 21–30",
                    "title": "Energy Audit Sprint",
                    "description": "Reduce home/office energy waste by 20%.",
                    "difficulty": "Easy",
                    "expected_impact_kg": 2.0,
                    "tasks": [
                        "Unplug chargers and devices when not in use",
                        "Switch to LED bulbs at your workstation",
                        "Set your thermostat 2°F/1°C more conservatively",
                    ],
                },
            ],
        },
        {
            "phase_number": 2,
            "phase_name": "Building Habits",
            "day_range": "Day 31–60",
            "milestones": [
                {
                    "day_range": "Day 31–40",
                    "title": "Active First/Last Mile",
                    "description": "Walk or cycle for the first/last mile of your commute.",
                    "difficulty": "Medium",
                    "expected_impact_kg": 3.0,
                    "tasks": [
                        "Get off one stop early on transit and walk the rest",
                        "Try a bike-share for last-mile connections",
                        "Invest in comfortable walking shoes for commute days",
                    ],
                },
                {
                    "day_range": "Day 41–50",
                    "title": "Carpooling Co-Pilot",
                    "description": "Find a carpool partner for at least 2 days per week.",
                    "difficulty": "Medium",
                    "expected_impact_kg": 4.0,
                    "tasks": [
                        "Ask coworkers who live nearby about ride-sharing",
                        "Join a carpooling app or neighborhood group",
                        "Commit to carpooling every Tuesday and Thursday",
                    ],
                },
                {
                    "day_range": "Day 51–60",
                    "title": "Fully Plant-Powered Lunches",
                    "description": "Transition to 100% plant-based weekday lunches.",
                    "difficulty": "Medium",
                    "expected_impact_kg": 3.0,
                    "tasks": [
                        "Explore vegan meal delivery or batch-cooking",
                        "Replace dairy-based snacks with plant alternatives",
                        "Share your favorite plant-based recipes with coworkers",
                    ],
                },
            ],
        },
        {
            "phase_number": 3,
            "phase_name": "Advanced Optimization",
            "day_range": "Day 61–90",
            "milestones": [
                {
                    "day_range": "Day 61–70",
                    "title": "Remote Work Negotiation",
                    "description": "Negotiate 1–2 remote work days to eliminate commute emissions entirely.",
                    "difficulty": "Hard",
                    "expected_impact_kg": 6.0,
                    "tasks": [
                        "Prepare a proposal for your manager showing productivity data",
                        "Start with one WFH day per week as a trial",
                        "Set up an energy-efficient home office",
                    ],
                },
                {
                    "day_range": "Day 71–80",
                    "title": "EV/Hybrid Test Drive",
                    "description": "Research and test-drive electric or hybrid vehicles for your next car.",
                    "difficulty": "Hard",
                    "expected_impact_kg": 5.0,
                    "tasks": [
                        "Compare EV/hybrid models suitable for your commute distance",
                        "Check local EV incentives and tax credits",
                        "Book a test drive at a local dealership",
                    ],
                },
                {
                    "day_range": "Day 81–90",
                    "title": "Green Energy Switch",
                    "description": "Switch to a renewable energy provider or green tariff.",
                    "difficulty": "Hard",
                    "expected_impact_kg": 3.0,
                    "tasks": [
                        "Research green energy providers in your area",
                        "Compare pricing vs. your current electricity plan",
                        "Make the switch or sign up for a green tariff",
                    ],
                },
            ],
        },
    ]


def _moderate_emission_roadmap() -> list[dict]:
    return [
        {
            "phase_number": 1,
            "phase_name": "Quick Wins",
            "day_range": "Day 1–30",
            "milestones": [
                {
                    "day_range": "Day 1–10",
                    "title": "Active Commute Days",
                    "description": "Replace 1 drive day with walking, cycling, or e-scooter.",
                    "difficulty": "Easy",
                    "expected_impact_kg": 3.0,
                    "tasks": [
                        "Map a walking or cycling route to work",
                        "Try an e-scooter rental for your commute",
                        "Start with one car-free commute day per week",
                    ],
                },
                {
                    "day_range": "Day 11–20",
                    "title": "Smart Meal Swaps",
                    "description": "Replace 2 meat meals per week with plant-based options.",
                    "difficulty": "Easy",
                    "expected_impact_kg": 2.5,
                    "tasks": [
                        "Try 'Meatless Monday' and 'Veggie Wednesday'",
                        "Explore plant-based protein sources (lentils, tofu, tempeh)",
                        "Find 3 new vegetarian recipes you enjoy",
                    ],
                },
                {
                    "day_range": "Day 21–30",
                    "title": "Phantom Load Elimination",
                    "description": "Eliminate standby power waste from electronics.",
                    "difficulty": "Easy",
                    "expected_impact_kg": 1.5,
                    "tasks": [
                        "Use smart power strips for your workstation",
                        "Set devices to auto-sleep after 5 minutes of inactivity",
                        "Unplug chargers when devices are fully charged",
                    ],
                },
            ],
        },
        {
            "phase_number": 2,
            "phase_name": "Building Habits",
            "day_range": "Day 31–60",
            "milestones": [
                {
                    "day_range": "Day 31–40",
                    "title": "Multi-Modal Commute",
                    "description": "Combine transit + active transport for 3 days per week.",
                    "difficulty": "Medium",
                    "expected_impact_kg": 3.0,
                    "tasks": [
                        "Park at a transit hub and ride the rest of the way",
                        "Use bike-share for first/last mile connections",
                        "Track time and cost savings from multi-modal commuting",
                    ],
                },
                {
                    "day_range": "Day 41–50",
                    "title": "Lunch Prep Master",
                    "description": "Batch-cook plant-based lunches to avoid food waste and emissions.",
                    "difficulty": "Medium",
                    "expected_impact_kg": 2.0,
                    "tasks": [
                        "Dedicate Sunday evenings to meal prepping",
                        "Invest in reusable containers and a thermal bag",
                        "Aim for 4 plant-based lunches per week",
                    ],
                },
                {
                    "day_range": "Day 51–60",
                    "title": "Efficiency Upgrade",
                    "description": "Upgrade one major energy-consuming appliance or habit.",
                    "difficulty": "Medium",
                    "expected_impact_kg": 2.0,
                    "tasks": [
                        "Replace an old monitor with an energy-efficient model",
                        "Switch to a laptop instead of a desktop for work",
                        "Install a programmable thermostat if you haven't already",
                    ],
                },
            ],
        },
        {
            "phase_number": 3,
            "phase_name": "Advanced Optimization",
            "day_range": "Day 61–90",
            "milestones": [
                {
                    "day_range": "Day 61–70",
                    "title": "Full Transit Week",
                    "description": "Go completely car-free for one full work week.",
                    "difficulty": "Hard",
                    "expected_impact_kg": 4.0,
                    "tasks": [
                        "Plan all 5 commute days using transit, walking, or cycling",
                        "Keep your car keys at home for the entire week",
                        "Journal how you feel about the car-free experience",
                    ],
                },
                {
                    "day_range": "Day 71–80",
                    "title": "Green Team Advocate",
                    "description": "Inspire coworkers to reduce their commute footprint.",
                    "difficulty": "Hard",
                    "expected_impact_kg": 2.0,
                    "tasks": [
                        "Share CarbonCoach with 3 coworkers",
                        "Organize a carpool or transit buddy system",
                        "Propose a 'green commute challenge' at work",
                    ],
                },
                {
                    "day_range": "Day 81–90",
                    "title": "Long-Term Vehicle Plan",
                    "description": "Create a concrete plan for your next vehicle purchase.",
                    "difficulty": "Hard",
                    "expected_impact_kg": 3.0,
                    "tasks": [
                        "Research EV charging infrastructure near your home and work",
                        "Calculate total cost of ownership: EV vs. current vehicle",
                        "Set a target date for transitioning to an EV or hybrid",
                    ],
                },
            ],
        },
    ]


def _low_emission_roadmap() -> list[dict]:
    return [
        {
            "phase_number": 1,
            "phase_name": "Fine-Tuning",
            "day_range": "Day 1–30",
            "milestones": [
                {
                    "day_range": "Day 1–10",
                    "title": "Zero-Emission Commute Streak",
                    "description": "Aim for 5 consecutive days of zero-emission commuting.",
                    "difficulty": "Easy",
                    "expected_impact_kg": 1.0,
                    "tasks": [
                        "Walk, cycle, or use transit exclusively for 5 days",
                        "Track your streak using a habit tracker app",
                        "Celebrate each streak milestone!",
                    ],
                },
                {
                    "day_range": "Day 11–20",
                    "title": "Fully Vegan Lunch Week",
                    "description": "Go 100% vegan for all weekday lunches.",
                    "difficulty": "Easy",
                    "expected_impact_kg": 1.5,
                    "tasks": [
                        "Stock up on plant-based proteins and snacks",
                        "Try a new vegan recipe each day",
                        "Share your experience on social media to inspire others",
                    ],
                },
                {
                    "day_range": "Day 21–30",
                    "title": "Energy Optimization Sprint",
                    "description": "Reduce your energy consumption by an additional 10%.",
                    "difficulty": "Easy",
                    "expected_impact_kg": 1.0,
                    "tasks": [
                        "Audit your workspace for any remaining energy waste",
                        "Enable dark mode on all devices to reduce screen energy",
                        "Use natural light whenever possible during the day",
                    ],
                },
            ],
        },
        {
            "phase_number": 2,
            "phase_name": "Community Impact",
            "day_range": "Day 31–60",
            "milestones": [
                {
                    "day_range": "Day 31–40",
                    "title": "Carbon Offset Research",
                    "description": "Research and select a verified carbon offset program.",
                    "difficulty": "Medium",
                    "expected_impact_kg": 2.0,
                    "tasks": [
                        "Compare Gold Standard and Verra-certified offset projects",
                        "Calculate your residual emissions to determine offset amount",
                        "Make your first offset purchase or subscription",
                    ],
                },
                {
                    "day_range": "Day 41–50",
                    "title": "Green Mentor",
                    "description": "Help 3 people in your network reduce their footprint.",
                    "difficulty": "Medium",
                    "expected_impact_kg": 1.5,
                    "tasks": [
                        "Share CarbonCoach with friends and family",
                        "Offer to carpool with a high-emission commuter",
                        "Host a 'green lunch' at work with plant-based options",
                    ],
                },
                {
                    "day_range": "Day 51–60",
                    "title": "Sustainable Purchasing",
                    "description": "Shift everyday purchases toward sustainable alternatives.",
                    "difficulty": "Medium",
                    "expected_impact_kg": 1.0,
                    "tasks": [
                        "Choose local and seasonal food for meals",
                        "Switch to a refillable water bottle and reusable bag",
                        "Research the carbon footprint of your most-bought brands",
                    ],
                },
            ],
        },
        {
            "phase_number": 3,
            "phase_name": "Leadership & Advocacy",
            "day_range": "Day 61–90",
            "milestones": [
                {
                    "day_range": "Day 61–70",
                    "title": "Workplace Sustainability Proposal",
                    "description": "Draft a formal proposal for greener workplace policies.",
                    "difficulty": "Hard",
                    "expected_impact_kg": 2.0,
                    "tasks": [
                        "Calculate the office's collective commuter footprint",
                        "Propose flexible remote work and transit subsidies",
                        "Present the proposal to management with data backing",
                    ],
                },
                {
                    "day_range": "Day 71–80",
                    "title": "Community Challenge Organizer",
                    "description": "Launch a 30-day green commute challenge in your community.",
                    "difficulty": "Hard",
                    "expected_impact_kg": 1.5,
                    "tasks": [
                        "Create a simple tracking sheet or group chat for participants",
                        "Set weekly milestones and share progress updates",
                        "Celebrate the group's collective CO2 savings at the end",
                    ],
                },
                {
                    "day_range": "Day 81–90",
                    "title": "Net-Zero Commute Goal",
                    "description": "Achieve and maintain net-zero weekly commuting emissions.",
                    "difficulty": "Hard",
                    "expected_impact_kg": 1.0,
                    "tasks": [
                        "Combine zero-emission commuting with verified offsets",
                        "Document your journey and share your CarbonCoach results",
                        "Set a 12-month maintenance plan to stay at net-zero",
                    ],
                },
            ],
        },
    ]
