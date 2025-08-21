export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_Sr4eDol0WIc4Ny',
    priceId: 'price_1RvMV2RCcsY5J3APzJMOHigT',
    name: 'STARTER',
    description: 'Perfect for individuals and small teams getting started with content planning',
    mode: 'subscription',
    price: 29.00,
    currency: 'usd',
    interval: 'month',
    features: [
      '3 social media accounts',
      '50 posts/month across all platforms',
      'Basic analytics (30 days)',
      'Email support only',
      'Basic content generation via Gemini',
      'Standard scheduling',
      'Basic hashtag suggestions',
      'Simple performance metrics'
    ]
  },
  {
    id: 'prod_Sr4eE8rC0v9uY8',
    priceId: 'price_1RvMVZRCcsY5J3APopknbsxN',
    name: 'PROFESSIONAL',
    description: 'Advanced features for growing businesses and content teams',
    mode: 'subscription',
    price: 79.00,
    currency: 'usd',
    interval: 'month',
    popular: true,
    features: [
      '10 social media accounts',
      '500 posts/month across all platforms',
      'Advanced analytics (90 days)',
      'Priority email + chat support',
      'Advanced AI content optimization',
      'A/B testing (2 variants)',
      'Competitor analysis',
      'Custom posting schedules',
      'Team collaboration (3 users)'
    ]
  },
  {
    id: 'prod_Sr4fcxqPAZpqSA',
    priceId: 'price_1RvMW2RCcsY5J3APhbK9eqRt',
    name: 'ENTERPRISE',
    description: 'Comprehensive solution for large organizations and agencies',
    mode: 'subscription',
    price: 199.00,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited social media accounts',
      '2,000 posts/month across all platforms',
      'Full analytics suite (1 year)',
      'Dedicated account manager',
      'All Professional features',
      'Advanced AI insights & predictions',
      'Custom integrations',
      'White-label options',
      'Team collaboration (10 users)',
      'API access'
    ]
  },
  {
    id: 'prod_Sr4fcjtsKniEyx',
    priceId: 'price_1RvMWbRCcsY5J3AP56ZxjaB3',
    name: 'AGENCY',
    description: 'Ultimate solution for agencies managing multiple clients',
    mode: 'subscription',
    price: 499.00,
    currency: 'usd',
    interval: 'month',
    features: [
      'Multi-client management',
      '10,000 posts/month total',
      'Complete analytics suite (unlimited)',
      '24/7 phone support',
      'Client billing management',
      'Custom branding',
      'Advanced team permissions',
      'Bulk operations',
      'Custom reporting',
      'Dedicated infrastructure'
    ]
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};