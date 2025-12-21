import type { Activity, Impact } from "../../hooks/useEcoPoints";
import { type Screen } from "../../App";
import { Leaf, Award, Calendar } from "lucide-react";

interface HomeProps {
  points: number;
  activities: Activity[];
  impact: Impact;
  onNavigate: (screen: Screen) => void;
}

export function Home({
  points,
  activities,
  impact,
  onNavigate,
}: HomeProps) {
  const recentActivities = activities.slice(0, 5);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (activity: Activity) => {
    if (activity.type === "recycling") return "♻️";
    if (activity.transportType === "walking") return "🚶";
    if (activity.transportType === "biking") return "🚴";
    if (activity.transportType === "public") return "🚌";
    if (activity.transportType === "car") return "🚗";
    return "✨";
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-4">
        <h2>Your EcoCity Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Making the city greener, one action at a time
        </p>
      </div>

      {/* Points Card */}
      <div className="bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1">Total EcoPoints</p>
            <h3 className="text-4xl">{points.toLocaleString()}</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Leaf className="w-8 h-8" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <button
            onClick={() => onNavigate("payment")}
            className="text-white hover:text-green-100 flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>View Payment Options</span>
          </button>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">♻️</span>
            <p className="text-purple-900">Recyclings</p>
          </div>
          <p className="text-purple-600">{impact.recyclingsCount}</p>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🚴</span>
            <p className="text-green-900">Distance</p>
          </div>
          <p className="text-green-600">{impact.totalDistance} km</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 col-span-2 text-center">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <span className="text-2xl">🌍</span>
            <p className="text-blue-900">CO₂ Saved</p>
          </div>
          <p className="text-blue-600">{impact.totalCO2Saved} kg</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Recent Activity
        </h3>
        {recentActivities.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
            <p>No activities yet</p>
            <p className="mt-1">
              Start logging your eco-friendly actions!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getActivityIcon(activity)}
                  </span>
                  <div>
                    <p className="text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-600">
                    {activity.points > 0
                      ? `+${activity.points}`
                      : activity.points}
                  </p>{" "}
                  {activity.co2Saved && activity.co2Saved > 0 && (
                    <p className="text-xs text-gray-500">
                      {activity.co2Saved}kg CO₂
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
