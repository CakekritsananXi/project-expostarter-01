import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { createCheckoutSession } from '../lib/stripe';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Pricing = () => {
  const { user, session } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!user || !session) {
      window.location.href = '/login';
      return;
    }

    setLoadingPriceId(priceId);

    try {
      const { url } = await createCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`,
        mode: 'subscription',
        token: session.access_token,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Scale your content strategy with the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STRIPE_PRODUCTS.map((product) => (
          <Card
            key={product.id}
            className={`relative ${product.popular ? 'ring-2 ring-sage' : ''}`}
            hover
          >
            {product.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-sage text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                {product.name}
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-neutral-900">
                  ${product.price}
                </span>
                <span className="text-neutral-600 ml-1">
                  /{product.interval}
                </span>
              </div>
              <p className="text-sm text-neutral-600">
                {product.description}
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-neutral-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              variant={product.popular ? 'primary' : 'outline'}
              size="lg"
              className="w-full"
              loading={loadingPriceId === product.priceId}
              onClick={() => handleSubscribe(product.priceId)}
            >
              {user ? 'Subscribe Now' : 'Sign Up to Subscribe'}
            </Button>
          </Card>
        ))}
      </div>

      {!user && (
        <div className="text-center mt-12">
          <p className="text-neutral-600 mb-4">
            Already have an account?
          </p>
          <Button variant="ghost" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pricing;