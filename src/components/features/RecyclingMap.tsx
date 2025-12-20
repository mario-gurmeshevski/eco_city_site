import { useState, useEffect } from "react";
import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface RecyclingPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'plasticRecycling' | 'tyreRecycling' | 'batteryRecycling';
  hours?: string;
  phone?: string;
  distance?: number;
}

// Mock recycling points data (in a real app, this would come from an API or open data source)
const mockRecyclingPoints: RecyclingPoint[] = [
  {
    id: '1',
    name: 'Vero Center Pakomak',
    address: '123 Green Street, Downtown',
    lat: 40.7128,
    lng: -74.0060,
    type: 'plasticRecycling',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM',
    phone: '+1 (555) 123-4567',
    distance: 0.5,
  },
  {
    id: '2',
    name: 'Ramstore Mall Battery Recycling',
    address: '456 Park Avenue',
    lat: 40.7580,
    lng: -73.9855,
    type: 'batteryRecycling',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM',
    distance: 1.2,
  },
  {
    id: '3',
    name: 'Gumatek Chair',
    address: '789 Oak Road',
    lat: 40.7489,
    lng: -73.9680,
    type: 'tyreRecycling',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM',
    distance: 0.9,
  },
  {
    id: '4',
    name: 'Diamond Mall Battery Recycling',
    address: '321 Elm Street',
    lat: 40.7614,
    lng: -73.9776,
    type: 'batteryRecycling',
    hours: 'Mon-Sun: 7AM-8PM',
    phone: '+1 (555) 987-6543',
    distance: 1.2,
  },
  {
    id: '5',
    name: 'East Gate Mall Plastic Recycling',
    address: '654 River Road',
    lat: 40.7282,
    lng: -73.9942,
    type: 'plasticRecycling',
    hours: 'Mon-Sat: 7AM-10PM',
    distance: 1.5,
  },
];

export function RecyclingMap() {
  const [points] = useState<RecyclingPoint[]>(mockRecyclingPoints);
  const [selectedPoint, setSelectedPoint] =
    useState<RecyclingPoint | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Unable to get your location. Please enable location services."
          );
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tyreRecycling': return '🔘';
      case 'plasticRecycling': return '♻️';
      case 'batteryRecycling': return '🔋';
      default: return '📍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "center":
        return "bg-blue-100 border-blue-300 text-blue-900";
      case "station":
        return "bg-green-100 border-green-300 text-green-900";
      case "bin":
        return "bg-gray-100 border-gray-300 text-gray-900";
      default:
        return "bg-purple-100 border-purple-300 text-purple-900";
    }
  };

  const openDirections = (point: RecyclingPoint) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Map Placeholder */}
      <div className="relative bg-linear-to-br from-green-100 to-blue-100 h-64 shrink-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-green-600 mx-auto mb-2" />
            <p className="text-gray-700">Interactive Map View</p>
            <p className="text-gray-500 text-sm mt-1">
              Showing {points.length} recycling points
            </p>
          </div>
        </div>

        {/* User Location Indicator */}
        {userLocation && (
          <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-2 shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">
              Your location
            </span>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 space-y-2">
          <button className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
            <Navigation className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Points List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3>Nearby Recycling Points</h3>
          <span className="text-sm text-gray-500">
            {points.length} locations
          </span>
        </div>

        {points.map((point) => (
          <div
            key={point.id}
            onClick={() =>
              setSelectedPoint(
                selectedPoint?.id === point.id ? null : point
              )
            }
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedPoint?.id === point.id
                ? "border-green-500 bg-green-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`text-3xl p-2 rounded-lg border ${getTypeColor(
                  point.type
                )}`}
              >
                {getTypeIcon(point.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-gray-900">{point.name}</h4>
                  {point.distance && (
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {point.distance} km
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-2">
                  {point.address}
                </p>

                {selectedPoint?.id === point.id && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                    {point.hours && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{point.hours}</span>
                      </div>
                    )}

                    {point.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a
                          href={`tel:${point.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {point.phone}
                        </a>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(point);
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-3"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
        <p className="text-sm text-gray-600 mb-2">Location Types:</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span>🔘</span>
            <span className="text-sm text-gray-700">Recycling Center</span>
          </div>
          <div className="flex items-center gap-2">
            <span>♻️</span>
            <span className="text-sm text-gray-700">
              Collection Station
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔋</span>
            <span className="text-sm text-gray-700">Recycling Bin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
