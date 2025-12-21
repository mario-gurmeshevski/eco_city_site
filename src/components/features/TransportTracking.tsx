import React, { useState, useEffect } from "react";
import {
  type TransportType,
  type Activity,
  calculateTransportPoints,
} from "../../hooks/useEcoPoints";
import { Calendar, MapPin } from "lucide-react";
import toast from "react-hot-toast";

interface TransportTrackingProps {
  onAddActivity: (
    activity: Omit<Activity, "id" | "timestamp">
  ) => void;
}

const transportOptions = [
  {
    type: "walking" as TransportType,
    icon: "🚶",
    label: "Walking",
    color: "bg-green-100 border-green-300",
  },
  {
    type: "biking" as TransportType,
    icon: "🚴",
    label: "Biking",
    color: "bg-blue-100 border-blue-300",
  },
  {
    type: "public" as TransportType,
    icon: "🚌",
    label: "Public Transport",
    color: "bg-purple-100 border-purple-300",
  },
  {
    type: "car" as TransportType,
    icon: "🚗",
    label: "Car",
    color: "bg-gray-100 border-gray-300",
  },
];

type TransportData = {
  traveled: number;
  date: string;
};

interface UserData {
  walking: TransportData[];
  biking: TransportData[];
  public_transport: TransportData[];
  car: TransportData[];
}

export function TransportTracking({
  onAddActivity,
}: TransportTrackingProps) {
  const [selectedType, setSelectedType] =
    useState<TransportType>("walking");
  const [distance, setDistance] = useState("");
  const [userTransportData, setUserTransportData] =
    useState<UserData>({
      walking: [],
      biking: [],
      public_transport: [],
      car: [],
    });

  const getTransportKey = (type: TransportType): keyof UserData => {
    const keyMap: Record<TransportType, keyof UserData> = {
      walking: "walking",
      biking: "biking",
      public: "public_transport",
      car: "car",
    };
    return keyMap[type];
  };

  const getTotalDistanceByType = (type: TransportType): number => {
    const history = getTransportHistory(type);
    return parseFloat(
      history.reduce((sum, trip) => sum + trip.traveled, 0).toFixed(2)
    );
  };

  useEffect(() => {
    const loadTransportData = () => {
      try {
        const currentUserData = localStorage.getItem("currentUser");
        const newUserData = localStorage.getItem("userTransportData");

        let finalData: UserData = {
          walking: [],
          biking: [],
          public_transport: [],
          car: [],
        };

        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData);

          finalData = {
            walking: currentUser.walking || [],
            biking: currentUser.biking || [],
            public_transport: currentUser.public_transport || [],
            car: currentUser.car || [],
          };
        }

        if (newUserData) {
          const newParsed = JSON.parse(newUserData);
          finalData = {
            walking: [
              ...finalData.walking,
              ...(newParsed.walking || []),
            ],
            biking: [
              ...finalData.biking,
              ...(newParsed.biking || []),
            ],
            public_transport: [
              ...finalData.public_transport,
              ...(newParsed.public_transport || []),
            ],
            car: [...finalData.car, ...(newParsed.car || [])],
          };
        }

        const transportKeys: (keyof UserData)[] = [
          "walking",
          "biking",
          "public_transport",
          "car",
        ];
        transportKeys.forEach((key) => {
          const trips = finalData[key];
          const seenDates = new Set<string>();
          finalData[key] = trips.filter((trip) => {
            if (seenDates.has(trip.date)) {
              return false;
            }
            seenDates.add(trip.date);
            return true;
          });
        });

        localStorage.setItem(
          "userTransportData",
          JSON.stringify(finalData)
        );
        setUserTransportData(finalData);
      } catch (error) {
        console.error("Error loading transport data:", error);
      }
    };

    loadTransportData();
    const interval = setInterval(loadTransportData, 2000);

    return () => clearInterval(interval);
  }, []);

  const getTransportHistory = (
    type: TransportType
  ): TransportData[] => {
    const history = userTransportData[getTransportKey(type)] || [];
    return history;
  };

  const saveTransportData = (newData: UserData) => {
    try {
      localStorage.setItem(
        "userTransportData",
        JSON.stringify(newData)
      );
      setUserTransportData(newData);
    } catch (error) {
      console.error("Error saving transport data:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const distanceNum = parseFloat(distance);
    if (isNaN(distanceNum) || distanceNum <= 0) return;

    const { points, co2Saved } = calculateTransportPoints(
      selectedType,
      distanceNum
    );

    onAddActivity({
      type: "transport",
      transportType: selectedType,
      distance: distanceNum,
      points,
      co2Saved,
      description: `${
        transportOptions.find((t) => t.type === selectedType)?.label
      } - ${distanceNum}km`,
    });

    const today = new Date().toLocaleDateString("en-GB");
    const transportKey = getTransportKey(selectedType);
    const newTrip: TransportData = {
      traveled: distanceNum,
      date: today,
    };

    const updatedData = {
      ...userTransportData,
      [transportKey]: [
        ...(userTransportData[transportKey] || []),
        newTrip,
      ],
    };

    saveTransportData(updatedData);
    toast.success(`Trip logged! ${points} points added`);
    setDistance("");
  };

  const previewPoints = distance
    ? calculateTransportPoints(
        selectedType,
        parseFloat(distance) || 0
      ).points
    : 0;
  const previewCO2 = distance
    ? calculateTransportPoints(
        selectedType,
        parseFloat(distance) || 0
      ).co2Saved
    : 0;

  const recentTrips = getTransportHistory(selectedType)
    .sort((a, b) => {
      const [aDay, aMonth, aYear] = a.date.split("-").map(Number);
      const [bDay, bMonth, bYear] = b.date.split("-").map(Number);
      const aDate = new Date(aYear, aMonth - 1, aDay).getTime();
      const bDate = new Date(bYear, bMonth - 1, bDay).getTime();
      return bDate - aDate;
    })
    .slice(0, 10);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Log Your Trip</h2>
        <p className="text-gray-600">
          Track your eco-friendly transportation and earn points!
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block mb-3 text-gray-700 font-medium">
            Select Transport Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {transportOptions.map((option) => {
              const totalDistance = getTotalDistanceByType(
                option.type
              );
              const tripCount = getTransportHistory(
                option.type
              ).length;

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setSelectedType(option.type)}
                  className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                    selectedType === option.type
                      ? "border-green-500 bg-green-50 shadow-md ring-2 ring-green-200"
                      : `${option.color} hover:shadow-md hover:scale-[1.02]`
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{option.icon}</span>
                    <p
                      className={`text-left ${
                        selectedType === option.type
                          ? "text-green-900 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </p>
                  </div>

                  <div className="text-left border-t pt-3 mt-3">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {totalDistance.toFixed(1)} km
                    </div>
                    <p className="text-xs text-gray-600">
                      {tripCount} {tripCount === 1 ? "trip" : "trips"}{" "}
                      total
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-linear-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Recent{" "}
              {
                transportOptions.find((t) => t.type === selectedType)
                  ?.label
              }{" "}
              Trips (Last 10)
            </h3>
          </div>

          {recentTrips.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentTrips.map((trip, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-xl backdrop-blur-sm border hover:bg-white/70 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      {trip.traveled.toFixed(1)} km
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 bg-white/60 px-2 py-1 rounded-full">
                    {trip.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>
                No{" "}
                {transportOptions
                  .find((t) => t.type === selectedType)
                  ?.label?.toLowerCase()}{" "}
                trips yet
              </p>
              <p className="text-sm">Log your first trip!</p>
            </div>
          )}
        </div>

        {distance && parseFloat(distance) > 0 && (
          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg">
            <p className="text-lg font-semibold text-gray-800 mb-4">
              Trip Preview
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-600">Distance:</span>
                <span className="font-bold text-2xl text-green-700">
                  {distance} km
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-600">Points to earn:</span>
                <span className="text-green-600 font-bold text-xl">
                  +{previewPoints} pts
                </span>
              </div>
              {previewCO2 > 0 && (
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">CO₂ saved:</span>
                  <span className="text-blue-600 font-bold">
                    {previewCO2.toFixed(1)} kg
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-gray-600 font-medium">
                  Impact:
                </span>
                <span
                  className={`font-bold px-3 py-1 rounded-full text-sm ${
                    selectedType === "walking" ||
                    selectedType === "biking"
                      ? "bg-green-100 text-green-800"
                      : selectedType === "public"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedType === "walking" ||
                  selectedType === "biking"
                    ? "🌟 Excellent!"
                    : selectedType === "public"
                    ? "✨ Good!"
                    : "👍 Keep trying!"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
