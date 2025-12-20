import React, { useState } from "react";
import {
  type TransportType,
  type Activity,
  calculateTransportPoints,
} from "../../hooks/useEcoPoints";
import { Check } from "lucide-react";
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

export function TransportTracking({
  onAddActivity,
}: TransportTrackingProps) {
  const [selectedType, setSelectedType] =
    useState<TransportType>("walking");
  const [distance, setDistance] = useState("");

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

    // Show success message
    toast.success(
      `Trip logged successfully! ${points} points added to your account`
    );
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

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="mb-2">Log Your Trip</h2>
        <p className="text-gray-600">
          Track your eco-friendly transportation and earn points!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transport Type Selection */}
        <div>
          <label className="block mb-3 text-gray-700">
            Select Transport Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {transportOptions.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => setSelectedType(option.type)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === option.type
                    ? "border-green-500 bg-green-50 shadow-md"
                    : `${option.color} hover:shadow-md`
                }`}
              >
                <span className="text-3xl mb-2 block">
                  {option.icon}
                </span>
                <p
                  className={
                    selectedType === option.type
                      ? "text-green-900"
                      : "text-gray-700"
                  }
                >
                  {option.label}
                </p>
                {selectedType === option.type && (
                  <div className="mt-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Distance Input */}
        <div>
          <label
            htmlFor="distance"
            className="block mb-2 text-gray-700"
          >
            Distance (km)
          </label>
          <input
            id="distance"
            type="number"
            step="0.1"
            min="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Enter distance"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        {/* Preview */}
        {distance && parseFloat(distance) > 0 && (
          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <p className="text-gray-700 mb-3">Trip Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Points to earn:</span>
                <span className="text-green-600">
                  +{previewPoints} pts
                </span>
              </div>
              {previewCO2 > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CO₂ saved:</span>
                  <span className="text-blue-600">
                    {previewCO2} kg
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Impact:</span>
                <span className="text-purple-600">
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!distance || parseFloat(distance) <= 0}
          className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          Log Trip & Earn Points
        </button>
      </form>
    </div>
  );
}
