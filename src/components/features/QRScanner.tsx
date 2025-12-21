import { useState } from "react";
import { type Activity } from "../../hooks/useEcoPoints";
import { Camera } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import toast from "react-hot-toast";

interface QRScannerProps {
  onAddActivity: (
    activity: Omit<Activity, "id" | "timestamp">
  ) => void;
}

export function QRScanner({ onAddActivity }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const handleScan = (result: string) => {
    if (!result || result.trim() === "") return;

    const cleanResult = result.trim();

    // Check if it starts with the prefix
    if (cleanResult.startsWith("ECOCITY_RECYCLE_")) {
      // Extract the number from the string after ECOCITY_RECYCLE_
      const pointsMatch = cleanResult.match(/ECOCITY_RECYCLE_(\d+)$/);

      if (pointsMatch) {
        const points = parseInt(pointsMatch[1]);

        onAddActivity({
          type: "recycling",
          recyclingType: "bottle", // Required by useEcoPoints
          points: points,
          description: `Recycling at collection point (+${points} pts)`,
        });

        toast.success(
          `Recycling confirmed! ${points} points added successfully!`
        );
        setManualCode("");
        setScanning(false);
      } else {
        toast.error("Invalid QR code format");
      }
    } else {
      toast.error(
        "Invalid QR code. Please scan a valid EcoCity recycling point"
      );
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scanner error:", error);
    toast.error("Camera access error. Please check permissions.");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(manualCode);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="mb-2">Scan Recycling Point</h2>
        <p className="text-gray-600">
          Scan the QR code at recycling stations to earn points!
        </p>
      </div>

      {/* Camera View */}
      <div className="space-y-4">
        {scanning ? (
          <div
            className="relative bg-black rounded-2xl overflow-hidden aspect-square"
            style={{ width: "100%", height: "100%" }}
          >
            <Scanner
              onScan={(detectedCodes) => {
                if (detectedCodes.length > 0) {
                  handleScan(detectedCodes[0].rawValue);
                }
              }}
              onError={handleError}
              scanDelay={500}
              constraints={{ facingMode: "environment" }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-white w-64 h-64 rounded-2xl shadow-lg opacity-50"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <button
                onClick={() => setScanning(false)}
                className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-red-700 transition-colors"
              >
                Stop Camera
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setScanning(true)}
            className="w-full bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-8 flex flex-col items-center gap-4 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Camera className="w-16 h-16" />
            <div>
              <p className="text-xl mb-1">Start Camera</p>
              <p className="text-green-100 text-sm">
                Scan QR code at recycling point
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Manual Code Entry */}
      <div className="border-t border-gray-200 pt-6">
        <p className="text-gray-700 mb-3">Or enter code manually:</p>
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="ECOCITY_RECYCLE_XXXXX"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Submit Code
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <p className="text-gray-700">How it works:</p>
        <div className="space-y-2">
          {[
            {
              icon: "1️⃣",
              text: "Find an EcoCity recycling point on the map",
            },
            {
              icon: "2️⃣",
              text: "Bring your recyclables to the location",
            },
            {
              icon: "3️⃣",
              text: "Scan the QR code at the recycling station",
            },
            {
              icon: "4️⃣",
              text: "Earn instant points and help the planet!",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3"
            >
              <span className="text-xl">{step.icon}</span>
              <p className="text-gray-700 text-sm pt-1">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
