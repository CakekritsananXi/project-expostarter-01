import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { getUserSubscription } from '../lib/stripe';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Success = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sage border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Payment Successful!
          </h1>

          <p className="text-neutral-600 mb-6">
            Thank you for subscribing to ContentFlow. Your account has been upgraded and you now have access to all premium features.
          </p>

          {subscription && (
            <div className="bg-sage/5 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-neutral-900 mb-2">
                Your Plan: {subscription.plan_name || 'Premium'}
              </h3>
              <p className="text-sm text-neutral-600">
                Status: {subscription.subscription_status}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={ArrowRight}
                iconPosition="right"
              >
                Go to Dashboard
              </Button>
            </Link>

            <Link href="/strategy">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
              >
                Start Planning Content
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Success;