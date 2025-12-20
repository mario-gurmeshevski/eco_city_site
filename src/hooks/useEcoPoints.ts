import { useState, useEffect } from "react";

export type TransportType = "walking" | "biking" | "public" | "car";
export type ActivityType =
  | "transport"
  | "recycling"
  | "parking"
  | "payment";

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

export interface User {
  id: number;
  name: string;
  surname: string;
  password: string;
  email: string;
  gender: string;
  age: number;
  municipality: string;
  points?: number;
  co2saved?: number;
  distanced?: number;
  recyclings?: number;
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
  public: 0.05,
  car: 0.25,
};

const CO2_SAVED_CAR = 0.2;

export function useEcoPoints() {
  const [points, setPoints] = useState(() => {
    const currentUserJson = localStorage.getItem("currentUser");

    if (currentUserJson) {
      try {
        const currentUser: User = JSON.parse(currentUserJson);
        if (
          typeof currentUser.points !== "undefined" &&
          currentUser.points !== null
        ) {
          return currentUser.points;
        }
      } catch (e) {
        console.warn("Failed to parse currentUser", e);
      }
    }

    const savedPointsStr = localStorage.getItem("ecoCity_points");
    if (savedPointsStr) {
      const parsedPoints = parseInt(savedPointsStr, 10);
      if (!isNaN(parsedPoints)) {
        return parsedPoints;
      }
    }

    return 0;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const savedActivitiesStr = localStorage.getItem(
      "ecoCity_activities"
    );
    if (savedActivitiesStr) {
      try {
        return JSON.parse(savedActivitiesStr);
      } catch (e) {
        console.warn("Failed to parse activities");
        return [];
      }
    }
    return [];
  });

  // Listen for login events and reinitialize points
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUserJson = localStorage.getItem("currentUser");

      if (currentUserJson) {
        try {
          const currentUser: User = JSON.parse(currentUserJson);
          const userPoints = currentUser.points ?? 0;
          setPoints(userPoints);

          const savedActivitiesStr = localStorage.getItem(
            "ecoCity_activities"
          );
          if (savedActivitiesStr) {
            setActivities(JSON.parse(savedActivitiesStr));
          }
        } catch (e) {
          console.warn(
            "Failed to parse currentUser on storage change"
          );
        }
      }
    };

    window.addEventListener("userLoggedIn", handleStorageChange);

    return () => {
      window.removeEventListener("userLoggedIn", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("ecoCity_points", points.toString());
    localStorage.setItem(
      "ecoCity_activities",
      JSON.stringify(activities)
    );

    const currentUserJson = localStorage.getItem("currentUser");
    if (currentUserJson) {
      try {
        const currentUser: User = JSON.parse(currentUserJson);
        const updatedUser = {
          ...currentUser,
          points: points,
        };
        localStorage.setItem(
          "currentUser",
          JSON.stringify(updatedUser)
        );
        window.dispatchEvent(new Event("userUpdated"));
      } catch (e) {
        console.warn("Failed to update user points");
      }
    }
  }, [points, activities]);

  const addActivity = (input: Omit<Activity, "id" | "timestamp">) => {
    let activity: Activity;

    if (input.type === "recycling") {
      activity = {
        ...input,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        timestamp: Date.now(),
        points: POINTS_MAP.recycling,
        co2Saved: 0.5,
      };
    } else if (
      input.type === "transport" &&
      input.transportType &&
      input.distance !== undefined &&
      input.distance >= 0
    ) {
      const calc = calculateTransportPoints(
        input.transportType,
        input.distance
      );
      activity = {
        ...input,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        timestamp: Date.now(),
        points: calc.points,
        co2Saved: calc.co2Saved,
      };
    } else {
      console.warn("Invalid activity:", input);
      return;
    }

    setActivities((prev) => [activity, ...prev]);
    setPoints((prev) => prev + activity.points);

    const currentUserJson = localStorage.getItem("currentUser");
    if (currentUserJson) {
      try {
        const currentUser: User = JSON.parse(currentUserJson);
        const updatedUser = { ...currentUser };

        if (input.type === "recycling") {
          updatedUser.recyclings = (updatedUser.recyclings || 0) + 1;
        } else if (
          input.type === "transport" &&
          input.distance !== undefined
        ) {
          updatedUser.distanced =
            (updatedUser.distanced || 0) + input.distance;
        }

        if (activity.co2Saved) {
          updatedUser.co2saved =
            (updatedUser.co2saved || 0) + activity.co2Saved;
        }

        localStorage.setItem(
          "currentUser",
          JSON.stringify(updatedUser)
        );
        window.dispatchEvent(new Event("userUpdated"));
      } catch (e) {
        console.warn("Failed to update user counters");
      }
    }
  };

  const deductPoints = (
    amount: number,
    description: string,
    activityType: "parking" | "payment" = "payment"
  ): boolean => {
    if (amount <= 0) {
      console.warn("Deduction amount must be positive");
      return false;
    }

    if (points < amount) {
      console.warn("Insufficient points");
      return false;
    }

    // Create activity record for the transaction
    const activity: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: activityType,
      points: -amount, // Negative to indicate deduction
      description: description,
    };

    setActivities((prev) => [activity, ...prev]);
    setPoints((prev) => prev - amount);

    // Update currentUser in localStorage
    const currentUserJson = localStorage.getItem("currentUser");
    if (currentUserJson) {
      try {
        const currentUser: User = JSON.parse(currentUserJson);
        const updatedUser = {
          ...currentUser,
          points: points - amount,
        };
        localStorage.setItem(
          "currentUser",
          JSON.stringify(updatedUser)
        );
        window.dispatchEvent(new Event("userUpdated"));
      } catch (e) {
        console.warn("Failed to update user points after deduction");
      }
    }

    return true;
  };

  const calculateImpact = (): Impact => {
    let totalCO2Saved = 0;
    let totalDistance = 0;
    let recyclingsCount = 0;
    let tripsCount = 0;

    activities.forEach((activity) => {
      if (activity.type === "recycling") {
        recyclingsCount++;
        if (activity.co2Saved) totalCO2Saved += activity.co2Saved;
      } else if (activity.type === "transport") {
        tripsCount++;
        if (activity.distance) totalDistance += activity.distance;
        if (activity.co2Saved) totalCO2Saved += activity.co2Saved;
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
    deductPoints,
    impact,
  };
}

export function calculateTransportPoints(
  type: TransportType,
  distance: number
) {
  const basePoints = POINTS_MAP[type];
  const distanceBonus = Math.floor(distance / 5) * 5;

  let co2Saved = 0;
  if (type === "walking" || type === "biking") {
    co2Saved = distance * CO2_SAVED_CAR;
  } else if (type === "public") {
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
