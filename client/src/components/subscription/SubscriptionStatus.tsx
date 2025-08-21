import { useEffect, useState } from 'react';
import { Crown, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { getUserSubscription } from '../../lib/stripe';
import { getProductByPriceId } from '../../stripe-config';

const SubscriptionStatus = () => {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user && session) {
        try {
          const sub = await getUserSubscription();
          setSubscription(sub);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user, session]);

  if (loading || !user) {
    return null;
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="font-medium text-amber-900">Free Plan</h3>
            <p className="text-sm text-amber-700">
              Upgrade to unlock premium features
            </p>
          </div>
        </div>
      </div>
    );
  }

  const product = getProductByPriceId(subscription.price_id);
  const planName = product?.name || 'Premium';

  return (
    <div className="bg-sage/5 border border-sage/20 rounded-xl p-4 mb-6">
      <div className="flex items-center space-x-3">
        <Crown className="w-5 h-5 text-sage" />
        <div>
          <h3 className="font-medium text-sage">
            {planName} Plan
          </h3>
          <p className="text-sm text-sage/80">
            Status: {subscription.subscription_status}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;