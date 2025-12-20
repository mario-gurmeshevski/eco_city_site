import { useState } from 'react';
import { Gift, Lock, Check, } from 'lucide-react';

interface RewardsProps {
  points: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  category: 'discount' | 'event' | 'voucher' | 'premium';
  partner?: string;
}

const rewards: Reward[] = [
  {
    id: '1',
    title: '10% Off Eco Store',
    description: 'Get 10% discount at participating eco-friendly stores',
    points: 100,
    icon: '🛍️',
    category: 'discount',
    partner: 'GreenShop',
  },
  {
    id: '2',
    title: 'Free Coffee',
    description: 'One free coffee at sustainable cafes',
    points: 150,
    icon: '☕',
    category: 'voucher',
    partner: 'EcoCafé',
  },
  {
    id: '3',
    title: 'Movie Ticket',
    description: 'Free entry to environmental documentary screenings',
    points: 200,
    icon: '🎬',
    category: 'event',
    partner: 'Green Cinema',
  },
  {
    id: '4',
    title: 'Bike Rental - 1 Day',
    description: 'Free 24-hour bike rental from city bike share',
    points: 250,
    icon: '🚴',
    category: 'voucher',
    partner: 'CityBike',
  },
  {
    id: '5',
    title: 'Eco Workshop Access',
    description: 'Free entry to sustainability workshops and events',
    points: 300,
    icon: '🎓',
    category: 'event',
    partner: 'EcoCity Events',
  },
  {
    id: '6',
    title: 'Plant a Tree',
    description: 'We plant a tree in your name in urban forests',
    points: 400,
    icon: '🌳',
    category: 'premium',
    partner: 'TreeForest Initiative',
  },
  {
    id: '7',
    title: 'Premium Rewards',
    description: 'Unlock exclusive eco-products and experiences',
    points: 500,
    icon: '⭐',
    category: 'premium',
    partner: 'Premium Partners',
  },
  {
    id: '8',
    title: '20% Green Products',
    description: '20% off on sustainable and recycled products',
    points: 350,
    icon: '🌿',
    category: 'discount',
    partner: 'EcoMarket',
  },
];

export function Rewards({ points }: RewardsProps) {
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const canAfford = (reward: Reward) => {
    return points >= reward.points && !redeemedRewards.includes(reward.id);
  };

  const redeemReward = (reward: Reward) => {
    if (canAfford(reward)) {
      setRedeemedRewards([...redeemedRewards, reward.id]);
      setSelectedReward(null);
      // In a real app, this would deduct points and generate a voucher
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'event': return 'bg-purple-100 border-purple-300 text-purple-900';
      case 'voucher': return 'bg-green-100 border-green-300 text-green-900';
      case 'premium': return 'bg-orange-100 border-orange-300 text-orange-900';
      default: return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  return (
    <div className="p-4 space-y-6 pb-8">
      <div>
        <h2 className="mb-2">Rewards Store</h2>
        <p className="text-gray-600">Redeem your EcoPoints for exclusive rewards!</p>
      </div>

      {/* Points Balance */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1">Available Balance</p>
            <h3 className="text-4xl">{points.toLocaleString()}</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Gift className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="space-y-4">
        <h3>Available Rewards</h3>
        
        <div className="grid gap-4">
          {rewards.map((reward) => {
            const isAffordable = canAfford(reward);
            const isRedeemed = redeemedRewards.includes(reward.id);

            return (
              <div
                key={reward.id}
                onClick={() => isAffordable && setSelectedReward(reward)}
                className={`border-2 rounded-xl p-4 transition-all ${
                  isRedeemed
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : isAffordable
                    ? 'border-green-300 bg-white hover:border-green-500 hover:shadow-lg cursor-pointer'
                    : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl p-3 rounded-xl border ${getCategoryColor(reward.category)}`}>
                    {reward.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-gray-900 mb-1">{reward.title}</h4>
                        {reward.partner && (
                          <p className="text-xs text-gray-500">Partner: {reward.partner}</p>
                        )}
                      </div>
                      
                      {isRedeemed ? (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span className="text-xs">Redeemed</span>
                        </div>
                      ) : (
                        <div className={`px-3 py-1 rounded-full ${
                          isAffordable ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          <span className="text-sm">{reward.points} pts</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{reward.description}</p>
                    
                    {!isAffordable && !isRedeemed && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Lock className="w-4 h-4" />
                        <span>Need {reward.points - points} more points</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-900 mb-2">💡 How Rewards Work</p>
        <div className="space-y-1 text-blue-700 text-sm">
          <p>• Earn EcoPoints by logging eco-friendly activities</p>
          <p>• Redeem points for discounts, events, and vouchers</p>
          <p>• Each reward can only be redeemed once</p>
          <p>• New rewards are added regularly!</p>
        </div>
      </div>

      {/* Redemption Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{selectedReward.icon}</div>
              <h3 className="mb-2">{selectedReward.title}</h3>
              <p className="text-gray-600">{selectedReward.description}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Reward Cost:</span>
                <span className="text-gray-900">{selectedReward.points} pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Your Balance:</span>
                <span className={points >= selectedReward.points ? 'text-green-600' : 'text-red-600'}>
                  {points} pts
                </span>
              </div>
              <div className="border-t border-gray-300 mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">After Redemption:</span>
                  <span className="text-blue-600">{points - selectedReward.points} pts</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => redeemReward(selectedReward)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                Redeem Now
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              This is a demo. In production, you would receive a voucher code.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
