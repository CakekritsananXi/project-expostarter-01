import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { queryClient, apiRequest } from '../lib/queryClient';
import { CreditCard, Calendar, Settings, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/use-toast';

interface Subscription {
  id: string;
  subscriptionId: string;
  priceId: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
}

const SubscriptionManager = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current subscription data
  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription>({
    queryKey: ['/api/subscription'],
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest('/api/subscription/cancel', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      toast({
        title: "Subscription cancelled",
        description: "Your subscription will remain active until the end of the current billing period.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reactivate subscription mutation
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest('/api/subscription/reactivate', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      toast({
        title: "Subscription reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reactivate subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/subscription/billing-portal', { method: 'POST' });
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'canceled':
        return 'text-orange-600 bg-orange-50';
      case 'past_due':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          Subscription Management
        </h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Manage your subscription, billing, and payment information.
        </p>
      </div>

      {/* Current Subscription */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Current Subscription</h2>
          {subscription && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          )}
        </div>

        {subscription ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-600">Billing Period</span>
                </div>
                <p className="text-neutral-900">
                  {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>

              {subscription.paymentMethodBrand && subscription.paymentMethodLast4 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-600">Payment Method</span>
                  </div>
                  <p className="text-neutral-900">
                    {subscription.paymentMethodBrand} •••• {subscription.paymentMethodLast4}
                  </p>
                </div>
              )}
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-600 mb-4">No active subscription found.</p>
            <Link href="/pricing">
              <Button variant="primary">
                View Plans
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Subscription Actions */}
      {subscription && (
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Subscription Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              icon={Settings}
              onClick={handleManageBilling}
              disabled={isLoading}
              className="justify-start"
            >
              {isLoading ? 'Loading...' : 'Manage Billing'}
            </Button>

            {subscription.cancelAtPeriodEnd ? (
              <Button
                variant="primary"
                onClick={() => reactivateSubscriptionMutation.mutate()}
                disabled={reactivateSubscriptionMutation.isPending}
                className="justify-start"
              >
                {reactivateSubscriptionMutation.isPending ? 'Reactivating...' : 'Reactivate Subscription'}
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={() => cancelSubscriptionMutation.mutate()}
                disabled={cancelSubscriptionMutation.isPending}
                className="justify-start"
              >
                {cancelSubscriptionMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManager;