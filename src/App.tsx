import { useState } from "react";
import { Home } from "./components/features/Home";
import { TransportTracking } from "./components/features/TransportTracking";
import { QRScanner } from "./components/features/QRScanner";
import { RecyclingMap } from "./components/features/RecyclingMap";
import { Rewards } from "./components/features/Rewards";
import { BottomNav } from "./components/features/BottomNav";
import { useEcoPoints } from "./hooks/useEcoPoints";
import LOGO1 from "/Logo1.png";

export type Screen = "home" | "transport" | "qr" | "map" | "rewards";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const { points, activities, addActivity, impact } = useEcoPoints();

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-blue-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* Header */}
        <header className="bg-linear-to-r from-green-600 to-emerald-600 text-white p-4 sticky top-0 z-10 shadow-md">
          <div className="flex items-center justify-between">
              <img
                  src={LOGO1}
                  alt="EcoCity logo"
                  className="w-20 h-auto"
              />
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <span>🌿</span>
              <span>{points.toLocaleString()} pts</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-8rem)]">
          {currentScreen === "home" && (
            <Home
              points={points}
              activities={activities}
              impact={impact}
              onNavigate={setCurrentScreen}
            />
          )}
          {currentScreen === "transport" && (
            <TransportTracking onAddActivity={addActivity} />
          )}
          {currentScreen === "qr" && (
            <QRScanner onAddActivity={addActivity} />
          )}
          {currentScreen === "map" && <RecyclingMap />}
          {currentScreen === "rewards" && <Rewards points={points} />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
        />
      </div>
    </div>
  );
}
