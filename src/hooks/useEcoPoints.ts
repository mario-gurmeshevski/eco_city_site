import { useState, useEffect } from "react";

export type TransportType = "walking" | "biking" | "public" | "carpool";
export type RecyclingType = "bottle" | "tyre" | "batterie";
export type ActivityType =
    | "transport"
    | "recycling"
    | "parking"
    | "payment";

export interface Activity {
    id: string;
    type: ActivityType;
    transportType?: TransportType;
    recyclingType?: RecyclingType;
    distance?: number;
    extraPeople?: number;
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

const RECYCLING_POINTS: Record<RecyclingType, number> = {
    bottle: 1,
    tyre: 400,
    batterie: 10,
};

const TRANSPORT_POINTS_PER_KM = {
    walking: 2,
    biking: 0.5,
    public: 0.2,
    carpool: 0.05,
};

const MIN_DISTANCE = 0.5;

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
        const savedActivitiesStr = localStorage.getItem("ecoCity_activities");
        if (savedActivitiesStr) {
            try {
                return JSON.parse(savedActivitiesStr);
            } catch (e) {
                console.warn("Failed to parse activities", e);
                return [];
            }
        }
        return [];
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const currentUserJson = localStorage.getItem("currentUser");

            if (currentUserJson) {
                try {
                    const currentUser: User = JSON.parse(currentUserJson);
                    const userPoints = currentUser.points ?? 0;
                    setPoints(userPoints);

                    const savedActivitiesStr = localStorage.getItem("ecoCity_activities");
                    if (savedActivitiesStr) {
                        setActivities(JSON.parse(savedActivitiesStr));
                    }
                } catch (e) {
                    console.warn("Failed to parse currentUser on storage change", e);
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
        localStorage.setItem("ecoCity_activities", JSON.stringify(activities));

        const currentUserJson = localStorage.getItem("currentUser");
        if (currentUserJson) {
            try {
                const currentUser: User = JSON.parse(currentUserJson);
                const updatedUser = {
                    ...currentUser,
                    points: points,
                };
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                window.dispatchEvent(new Event("userUpdated"));
            } catch (e) {
                console.warn("Failed to update user points", e);
            }
        }
    }, [points, activities]);

    const addActivity = (input: Omit<Activity, "id" | "timestamp">) => {
        let activity: Activity;

        if (input.type === "recycling" && input.recyclingType) {
            const recyclingPoints = RECYCLING_POINTS[input.recyclingType];

            activity = {
                ...input,
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                timestamp: Date.now(),
                points: recyclingPoints,
                co2Saved: 0.5,
            };
        } else if (
            input.type === "transport" &&
            input.transportType &&
            input.distance !== undefined
        ) {
            const calc = calculateTransportPoints(
                input.transportType,
                input.distance,
                input.extraPeople
            );

            activity = {
                ...input,
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
                    updatedUser.distanced = (updatedUser.distanced || 0) + input.distance;
                }

                if (activity.co2Saved) {
                    updatedUser.co2saved = (updatedUser.co2saved || 0) + activity.co2Saved;
                }

                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                window.dispatchEvent(new Event("userUpdated"));
            } catch (e) {
                console.warn("Failed to update user counters", e);
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

        const activity: Activity = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            timestamp: Date.now(),
            type: activityType,
            points: -amount,
            description: description,
        };

        setActivities((prev) => [activity, ...prev]);
        setPoints((prev) => prev - amount);

        const currentUserJson = localStorage.getItem("currentUser");
        if (currentUserJson) {
            try {
                const currentUser: User = JSON.parse(currentUserJson);
                const updatedUser = {
                    ...currentUser,
                    points: points - amount,
                };
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                window.dispatchEvent(new Event("userUpdated"));
            } catch (e) {
                console.warn("Failed to update user points after deduction", e);
            }
        }

        return true;
    };

    const calculateImpact = (): Impact => {
        const currentUserJson = localStorage.getItem("currentUser");
        let baseCO2Saved = 0;
        let baseDistance = 0;
        let baseRecyclings = 0;

        if (currentUserJson) {
            try {
                const currentUser: User = JSON.parse(currentUserJson);
                baseCO2Saved = currentUser.co2saved || 0;
                baseDistance = currentUser.distanced || 0;
                baseRecyclings = currentUser.recyclings || 0;
            } catch (e) {
                console.warn("Failed to parse currentUser for impact calculation", e);
            }
        }

        let recentCO2Saved = 0;
        let recentDistance = 0;
        let recentRecyclings = 0;
        let tripsCount = 0;

        activities.forEach((activity) => {
            if (activity.type === "recycling") {
                recentRecyclings++;
                if (activity.co2Saved) recentCO2Saved += activity.co2Saved;
            } else if (activity.type === "transport") {
                tripsCount++;
                if (activity.distance) recentDistance += activity.distance;
                if (activity.co2Saved) recentCO2Saved += activity.co2Saved;
            }
        });

        return {
            totalCO2Saved: parseFloat((baseCO2Saved + recentCO2Saved).toFixed(2)),
            totalDistance: parseFloat((baseDistance + recentDistance).toFixed(2)),
            recyclingsCount: baseRecyclings + recentRecyclings,
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
    distance: number,
    extraPeople: number = 0
) {
    if (distance < MIN_DISTANCE) {
        return { points: 0, co2Saved: 0 };
    }

    let points = 0;
    let co2Saved = 0;

    switch (type) {
        case "walking":
        case "biking":
            points = distance * TRANSPORT_POINTS_PER_KM[type];
            co2Saved = distance * CO2_SAVED_CAR;
            break;

        case "public":
            points = distance * TRANSPORT_POINTS_PER_KM.public;
            co2Saved = distance * (CO2_SAVED_CAR - 0.5);
            break;

        case "carpool":
            points = distance * extraPeople * TRANSPORT_POINTS_PER_KM.carpool;
            co2Saved = distance * extraPeople * CO2_SAVED_CAR * 0.2;
            break;
    }

    return {
        points: parseFloat(points.toFixed(2)),
        co2Saved: parseFloat(co2Saved.toFixed(2)),
    };
}

export function getRecyclingPoints(type: RecyclingType): number {
    return RECYCLING_POINTS[type];
}