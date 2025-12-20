import { type Screen } from '../../App';
import { Home, MapPin, Gift, QrCode, Navigation } from 'lucide-react';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home' as Screen, icon: Home, label: 'Home' },
    { id: 'transport' as Screen, icon: Navigation, label: 'Transport' },
    { id: 'qr' as Screen, icon: QrCode, label: 'Scan' },
    { id: 'map' as Screen, icon: MapPin, label: 'Map' },
    { id: 'rewards' as Screen, icon: Gift, label: 'Rewards' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs ${isActive ? '' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-green-600 rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
