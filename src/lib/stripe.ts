import { supabase } from './supabase';

interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode: 'payment' | 'subscription';
  token: string;
}

export const createCheckoutSession = async (params: CreateCheckoutSessionParams) => {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${params.token}`,
    },
    body: JSON.stringify({
      price_id: params.priceId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      mode: params.mode,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
};

export const getUserSubscription = async () => {
  const { data, error } = await supabase
    .from('stripe_user_subscriptions')
    .select('*')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};