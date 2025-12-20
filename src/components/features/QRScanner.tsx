import { useState, useEffect, useRef } from 'react';
import {type Activity, getRecyclingPoints } from '../../hooks/useEcoPoints';
import { Camera, Check, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onAddActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export function QRScanner({ onAddActivity }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleScan = (code: string) => {
    if (!code || code.trim() === '') return;

    // Validate QR code (in a real app, this would verify with a backend)
    if (code.startsWith('ECOCITY_RECYCLE_')) {
      const points = getRecyclingPoints();
      
      onAddActivity({
        type: 'recycling',
        points,
        description: 'Recycling at collection point',
      });

      setShowSuccess(true);
      setManualCode('');
      stopScanning();
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(manualCode);
  };

  // Simulate QR scan (in a real app, you would use a QR code library)
  const simulateScan = () => {
    handleScan('ECOCITY_RECYCLE_' + Date.now());
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="mb-2">Scan Recycling Point</h2>
        <p className="text-gray-600">Scan the QR code at recycling stations to earn points!</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
          <div className="bg-green-500 text-white rounded-full p-1">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-green-900">Recycling confirmed!</p>
            <p className="text-green-700 text-sm">+{getRecyclingPoints()} points added</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
          <div className="bg-red-500 text-white rounded-full p-1">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-red-900">Invalid QR code</p>
            <p className="text-red-700 text-sm">Please scan a valid EcoCity recycling point</p>
          </div>
        </div>
      )}

      {/* Camera View */}
      <div className="space-y-4">
        {scanning ? (
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-square">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-4 border-white w-64 h-64 rounded-2xl shadow-lg opacity-50"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <button
                onClick={simulateScan}
                className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 transition-colors"
              >
                Simulate Scan
              </button>
              <button
                onClick={stopScanning}
                className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-red-700 transition-colors"
              >
                Stop Camera
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={startScanning}
            className="w-full bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-8 flex flex-col items-center gap-4 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Camera className="w-16 h-16" />
            <div>
              <p className="text-xl mb-1">Start Camera</p>
              <p className="text-green-100 text-sm">Scan QR code at recycling point</p>
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

      {/* Points Info */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">♻️</span>
          <div>
            <p className="text-purple-900">Recycling Rewards</p>
            <p className="text-purple-700 text-sm">Earn {getRecyclingPoints()} points per scan</p>
          </div>
        </div>
        <div className="bg-white/50 rounded-lg p-3 mt-3">
          <p className="text-purple-900 text-sm">
            Find EcoCity recycling points near you using the map feature!
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <p className="text-gray-700">How it works:</p>
        <div className="space-y-2">
          {[
            { icon: '1️⃣', text: 'Find an EcoCity recycling point on the map' },
            { icon: '2️⃣', text: 'Bring your recyclables to the location' },
            { icon: '3️⃣', text: 'Scan the QR code at the recycling station' },
            { icon: '4️⃣', text: 'Earn instant points and help the planet!' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
              <span className="text-xl">{step.icon}</span>
              <p className="text-gray-700 text-sm pt-1">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
