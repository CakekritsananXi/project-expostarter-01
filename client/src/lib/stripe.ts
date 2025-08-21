import { authAPI } from './auth';

interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode: 'payment' | 'subscription';
}

export const createCheckoutSession = async (params: CreateCheckoutSessionParams) => {
  const token = authAPI.getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      priceId: params.priceId,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
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
  const token = authAPI.getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/stripe/subscription', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get subscription');
  }

  const data = await response.json();
  return data.subscription;
};

export const getSubscriptionDetails = async () => {
  const token = authAPI.getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/stripe/subscription/details', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get subscription details');
  }

  return response.json();
};

export const changePlan = async (newPriceId: string) => {
  const token = authAPI.getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/stripe/subscription/change-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ newPriceId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change plan');
  }

  return response.json();
};

export const cancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
  const token = authAPI.getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/stripe/subscription/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ cancelAtPeriodEnd }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel subscription');
  }

  return response.json();
};

export const reactivateSubscription = async () => {
  const token = authAPI.getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/stripe/subscription/reactivate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reactivate subscription');
  }

  return response.json();
};