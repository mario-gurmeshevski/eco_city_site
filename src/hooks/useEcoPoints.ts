import { useState, useEffect } from 'react';

export type TransportType = 'walking' | 'biking' | 'public' | 'car';
export type ActivityType = 'transport' | 'recycling';

export interface Activity {
  id: string;
  type: ActivityType;
  transportType?: TransportType;
  distance?: number;
  points: number;
  timestamp: number;
  description: string;
  co2Saved?: number;
}

export interface Impact {
  totalCO2Saved: number;
  totalDistance: number;
  recyclingsCount: number;
  tripsCount: number;
}

const POINTS_MAP = {
  walking: 10,
  biking: 15,
  public: 8,
  car: 2,
  recycling: 20,
};

const CO2_FACTOR = {
  walking: 0,
  biking: 0,
  public: 0.05, // kg CO2 per km
  car: 0.25, // kg CO2 per km
};

const CO2_SAVED_CAR = 0.2; // Average car emissions per km that we save

export function useEcoPoints() {
  const [points, setPoints] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPoints = localStorage.getItem('ecoCity_points');
    const savedActivities = localStorage.getItem('ecoCity_activities');
    
    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedActivities) setActivities(JSON.parse(savedActivities));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('ecoCity_points', points.toString());
    localStorage.setItem('ecoCity_activities', JSON.stringify(activities));
  }, [points, activities]);

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
    };

    setActivities(prev => [newActivity, ...prev]);
    setPoints(prev => prev + activity.points);
  };

  const calculateImpact = (): Impact => {
    let totalCO2Saved = 0;
    let totalDistance = 0;
    let recyclingsCount = 0;
    let tripsCount = 0;

    activities.forEach(activity => {
      if (activity.type === 'recycling') {
        recyclingsCount++;
        totalCO2Saved += 0.5; // Assume 0.5 kg CO2 saved per recycling action
      } else if (activity.type === 'transport') {
        tripsCount++;
        if (activity.distance) {
          totalDistance += activity.distance;
          if (activity.co2Saved) {
            totalCO2Saved += activity.co2Saved;
          }
        }
      }
    });

    return {
      totalCO2Saved: parseFloat(totalCO2Saved.toFixed(2)),
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      recyclingsCount,
      tripsCount,
    };
  };

  const impact = calculateImpact();

  return {
    points,
    activities,
    addActivity,
    impact,
  };
}

export function calculateTransportPoints(type: TransportType, distance: number) {
  const basePoints = POINTS_MAP[type];
  const distanceBonus = Math.floor(distance / 5) * 5; // 5 points per 5km
  
  let co2Saved = 0;
  if (type === 'walking' || type === 'biking') {
    co2Saved = distance * CO2_SAVED_CAR;
  } else if (type === 'public') {
    co2Saved = distance * (CO2_SAVED_CAR - CO2_FACTOR.public);
  }

  return {
    points: basePoints + distanceBonus,
    co2Saved: parseFloat(co2Saved.toFixed(2)),
  };
}

export function getRecyclingPoints() {
  return POINTS_MAP.recycling;
}
