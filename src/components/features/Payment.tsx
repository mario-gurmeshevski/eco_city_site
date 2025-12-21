import { useState, useEffect } from "react";
import {
  QrCode,
  Car,
  Wallet,
  Clock,
  MapPin,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { useEcoPoints } from "../../hooks/useEcoPoints";

export function Payment() {
  const { points, deductPoints } = useEcoPoints();

  // Parking payment state
  const [location, setLocation] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [parkingHours, setParkingHours] = useState(1);
  const [totalCost, setTotalCost] = useState(25); // 1 hour = 25 tokens
  const [showParkingQR, setShowParkingQR] = useState(false);

  // Payment QR state
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showPaymentQR, setShowPaymentQR] = useState(false);

  // Calculate cost based on parking hours (1 hour = 25 tokens)
  const calculateCost = (hours: number) => {
    return hours * 25;
  };

  // Handle parking form submission
  const handleParkingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    if (!licensePlate.trim()) {
      toast.error("Please enter a license plate");
      return;
    }

    if (parkingHours <= 0) {
      toast.error("Parking hours must be greater than 0");
      return;
    }

    if (points < totalCost) {
      toast.error(
        `Insufficient tokens. You need ${totalCost} tokens but only have ${points}`
      );
      return;
    }

    // Deduct points
    const success = deductPoints(
      totalCost,
      `Parking: ${licensePlate} at ${location} for ${parkingHours}h`,
      "parking"
    );

    if (success) {
      setShowParkingQR(true);
      toast.success("Parking QR code generated and tokens deducted!");
    } else {
      toast.error("Failed to deduct tokens. Please try again.");
    }
  };

  // Handle payment QR generation
  const handleGeneratePaymentQR = () => {
    if (paymentAmount <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    if (points < paymentAmount) {
      toast.error(
        `Insufficient tokens. You need ${paymentAmount} tokens but only have ${points}`
      );
      return;
    }

    // Deduct points
    const success = deductPoints(
      paymentAmount,
      `Payment: ${paymentAmount} tokens`,
      "payment"
    );

    if (success) {
      setShowPaymentQR(true);
      toast.success("Payment QR code generated and tokens deducted!");
    } else {
      toast.error("Failed to deduct tokens. Please try again.");
    }
  };

  // Copy QR code to clipboard
  const copyQRToClipboard = (qrValue: string) => {
    navigator.clipboard.writeText(qrValue);
    toast.success("QR code copied to clipboard!");
  };

  // Close QR modal and reset form
  const closeQRModal = () => {
    if (showParkingQR) {
      setLocation("");
      setLicensePlate("");
      setParkingHours(1);
    }
    if (showPaymentQR) {
      setPaymentAmount(0);
    }
    setShowParkingQR(false);
    setShowPaymentQR(false);
  };

  // Update total cost when parking hours change
  useEffect(() => {
    setTotalCost(calculateCost(parkingHours));
  }, [parkingHours]);

  return (
    <div className="p-4 space-y-6 pb-8">
      <div>
        <h2 className="mb-2">EcoPay System</h2>
        <p className="text-gray-600">
          Use your EcoTokens for parking and payments
        </p>
      </div>

      {/* Points Balance */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1">Available Tokens</p>
            <h3 className="text-4xl">{points.toLocaleString()}</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Wallet className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Parking Payment Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Parking Payment</h3>
        </div>

        <form onSubmit={handleParkingSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter parking location"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="licensePlate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              License Plate
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="licensePlate"
                value={licensePlate}
                onChange={(e) =>
                  setLicensePlate(e.target.value.toUpperCase())
                }
                placeholder="Enter license plate (e.g., ABC-1234)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="hours"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Parking Hours
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                id="hours"
                min="1"
                value={parkingHours}
                onChange={(e) => {
                  const hours = parseInt(e.target.value) || 1;
                  setParkingHours(hours);
                  setTotalCost(calculateCost(hours));
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cost: {totalCost} tokens
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Cost:</span>
              <span className="text-xl font-bold text-green-600">
                {totalCost} tokens
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-700">Your Balance:</span>
              <span
                className={`text-xl font-bold ${
                  points >= totalCost
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {points} tokens
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={points < totalCost}
            className={`w-full py-3 px-4 rounded-xl transition-all ${
              points >= totalCost
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Generate Parking QR
          </button>
        </form>
      </div>

      {/* Payment QR Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Payment QR</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="paymentAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Amount (tokens)
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                id="paymentAmount"
                min="1"
                value={paymentAmount || ""}
                onChange={(e) =>
                  setPaymentAmount(parseInt(e.target.value) || 0)
                }
                placeholder="Enter payment amount"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Payment Amount:</span>
              <span className="text-xl font-bold text-blue-600">
                {paymentAmount} tokens
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-700">Your Balance:</span>
              <span
                className={`text-xl font-bold ${
                  points >= paymentAmount
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {points} tokens
              </span>
            </div>
          </div>

          <button
            onClick={handleGeneratePaymentQR}
            disabled={paymentAmount <= 0 || points < paymentAmount}
            className={`w-full py-3 px-4 rounded-xl transition-all ${
              paymentAmount > 0 && points >= paymentAmount
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Generate Payment QR
          </button>
        </div>
      </div>

      {/* QR Modals */}
      {showParkingQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 text-green-600">
                <Car className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Parking QR Code
              </h3>
              <p className="text-gray-600">
                Show this QR code at the parking station
              </p>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <QRCodeSVG
                  value={`PARKING:${licensePlate}:${location}:${parkingHours}HRS:${totalCost}TOKENS`}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="mt-4 text-center space-y-1">
                <div className="bg-green-50 rounded-lg px-4 py-2 mb-2">
                  <p className="text-xs text-gray-500">
                    License Plate
                  </p>
                  <p className="font-bold text-lg text-green-700">
                    {licensePlate}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {location}
                </p>
                <p className="text-sm text-gray-600">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {parkingHours} hour{parkingHours > 1 ? "s" : ""} ={" "}
                  {totalCost} tokens
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  copyQRToClipboard(
                    `PARKING:${licensePlate}:${location}:${parkingHours}HRS:${totalCost}TOKENS`
                  )
                }
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy QR Data
              </button>

              <button
                onClick={closeQRModal}
                className="py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 text-blue-600">
                <QrCode className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Payment QR Code
              </h3>
              <p className="text-gray-600">
                Show this QR code to the cashier
              </p>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <QRCodeSVG
                  value={`PAYMENT:${paymentAmount}TOKENS`}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="mt-4 text-center">
                <p className="font-semibold">
                  {paymentAmount} tokens
                </p>
                <p className="text-gray-600">Payment amount</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  copyQRToClipboard(`PAYMENT:${paymentAmount}TOKENS`)
                }
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy QR Data
              </button>

              <button
                onClick={closeQRModal}
                className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
