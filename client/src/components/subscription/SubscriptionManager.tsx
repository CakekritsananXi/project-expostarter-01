
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Download,
  Plus,
  Trash2,
  Star
} from 'lucide-react';
import { authAPI } from '../../lib/auth';
import { STRIPE_PRODUCTS, getProductByPriceId } from '../../stripe-config';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface SubscriptionDetails {
  subscription: any;
  customer: any;
  customerId: string;
}

interface BillingHistory {
  invoices: any[];
  charges: any[];
}

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const SubscriptionManager = () => {
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory>({ invoices: [], charges: [] });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'payment-methods'>('overview');

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [detailsRes, historyRes, methodsRes] = await Promise.all([
        fetch('/api/stripe/subscription/details', {
          headers: { 'Authorization': `Bearer ${authAPI.getToken()}` }
        }),
        fetch('/api/stripe/billing-history', {
          headers: { 'Authorization': `Bearer ${authAPI.getToken()}` }
        }),
        fetch('/api/stripe/payment-methods', {
          headers: { 'Authorization': `Bearer ${authAPI.getToken()}` }
        })
      ]);

      if (detailsRes.ok) {
        const details = await detailsRes.json();
        setSubscriptionDetails(details);
      }

      if (historyRes.ok) {
        const history = await historyRes.json();
        setBillingHistory(history);
      }

      if (methodsRes.ok) {
        const methods = await methodsRes.json();
        setPaymentMethods(methods.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (newPriceId: string) => {
    setActionLoading('change-plan');
    try {
      const response = await fetch('/api/stripe/subscription/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authAPI.getToken()}`
        },
        body: JSON.stringify({ newPriceId })
      });

      if (response.ok) {
        await fetchSubscriptionData();
        alert('Plan changed successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to change plan: ${error.error}`);
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      alert('Failed to change plan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
    const confirmMessage = cancelAtPeriodEnd 
      ? 'Cancel subscription at the end of current period?'
      : 'Cancel subscription immediately?';
      
    if (!confirm(confirmMessage)) return;

    setActionLoading('cancel');
    try {
      const response = await fetch('/api/stripe/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authAPI.getToken()}`
        },
        body: JSON.stringify({ cancelAtPeriodEnd })
      });

      if (response.ok) {
        await fetchSubscriptionData();
        alert('Subscription canceled successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to cancel subscription: ${error.error}`);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading('reactivate');
    try {
      const response = await fetch('/api/stripe/subscription/reactivate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authAPI.getToken()}`
        }
      });

      if (response.ok) {
        await fetchSubscriptionData();
        alert('Subscription reactivated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to reactivate subscription: ${error.error}`);
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Failed to reactivate subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPaymentMethod = async () => {
    setActionLoading('add-payment');
    try {
      const response = await fetch('/api/stripe/setup-intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authAPI.getToken()}`
        }
      });

      if (response.ok) {
        const { setupIntent } = await response.json();
        const stripe = await stripePromise;
        
        if (stripe) {
          const { error } = await stripe.confirmCardSetup(setupIntent.client_secret);
          
          if (error) {
            alert(`Failed to add payment method: ${error.message}`);
          } else {
            await fetchSubscriptionData();
            alert('Payment method added successfully!');
          }
        }
      } else {
        const error = await response.json();
        alert(`Failed to setup payment method: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      alert('Failed to add payment method');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Delete this payment method?')) return;

    setActionLoading('delete-payment');
    try {
      const response = await fetch(`/api/stripe/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authAPI.getToken()}`
        }
      });

      if (response.ok) {
        await fetchSubscriptionData();
        alert('Payment method deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete payment method: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sage border-t-transparent" />
      </div>
    );
  }

  const currentPlan = subscriptionDetails?.subscription 
    ? getProductByPriceId(subscriptionDetails.subscription.items.data[0].price.id)
    : null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-900">Subscription Management</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: Star },
            { key: 'billing', label: 'Billing History', icon: Calendar },
            { key: 'payment-methods', label: 'Payment Methods', icon: CreditCard }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-sage text-sage'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Subscription */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
            
            {subscriptionDetails?.subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-sage">
                      {currentPlan?.name || 'Custom Plan'}
                    </h3>
                    <p className="text-neutral-600">
                      {formatCurrency(subscriptionDetails.subscription.items.data[0].price.unit_amount)} / {subscriptionDetails.subscription.items.data[0].price.recurring.interval}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      subscriptionDetails.subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : subscriptionDetails.subscription.status === 'past_due'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriptionDetails.subscription.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {subscriptionDetails.subscription.status === 'past_due' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {subscriptionDetails.subscription.status === 'canceled' && <XCircle className="w-3 h-3 mr-1" />}
                      {subscriptionDetails.subscription.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
                  <div>
                    <p className="text-sm text-neutral-600">Current Period</p>
                    <p className="font-medium">
                      {formatDate(subscriptionDetails.subscription.current_period_start)} - {formatDate(subscriptionDetails.subscription.current_period_end)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Next Billing</p>
                    <p className="font-medium">
                      {subscriptionDetails.subscription.cancel_at_period_end 
                        ? 'Cancels at period end'
                        : formatDate(subscriptionDetails.subscription.current_period_end)
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Amount</p>
                    <p className="font-medium">
                      {formatCurrency(subscriptionDetails.subscription.items.data[0].price.unit_amount)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  {subscriptionDetails.subscription.cancel_at_period_end ? (
                    <Button
                      onClick={handleReactivateSubscription}
                      loading={actionLoading === 'reactivate'}
                      variant="primary"
                    >
                      Reactivate Subscription
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCancelSubscription(true)}
                      loading={actionLoading === 'cancel'}
                      variant="outline"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600 mb-4">No active subscription found</p>
                <Button onClick={() => window.location.href = '/pricing'} variant="primary">
                  Choose a Plan
                </Button>
              </div>
            )}
          </Card>

          {/* Available Plans */}
          {subscriptionDetails?.subscription && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Change Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STRIPE_PRODUCTS.map((product) => (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-4 ${
                      product.priceId === subscriptionDetails.subscription.items.data[0].price.id
                        ? 'border-sage bg-sage/5'
                        : 'border-neutral-200'
                    }`}
                  >
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-2xl font-bold text-sage">${product.price}</p>
                    <p className="text-sm text-neutral-600 mb-4">/{product.interval}</p>
                    
                    {product.priceId === subscriptionDetails.subscription.items.data[0].price.id ? (
                      <Button variant="outline" disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePlanChange(product.priceId)}
                        loading={actionLoading === 'change-plan'}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Switch to {product.name}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Billing History Tab */}
      {activeTab === 'billing' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>
          
          {billingHistory.invoices.length > 0 || billingHistory.charges.length > 0 ? (
            <div className="space-y-4">
              {/* Invoices */}
              {billingHistory.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium">
                          Invoice #{invoice.number || invoice.id.slice(-8)}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {formatDate(invoice.created)} • {invoice.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">
                      {formatCurrency(invoice.total)}
                    </span>
                    {invoice.invoice_pdf && (
                      <Button
                        onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                        variant="ghost"
                        size="sm"
                        icon={Download}
                      >
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* One-time charges */}
              {billingHistory.charges.map((charge) => (
                <div key={charge.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium">Payment</p>
                        <p className="text-sm text-neutral-600">
                          {formatDate(charge.created)} • {charge.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">
                      {formatCurrency(charge.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No billing history found</p>
            </div>
          )}
        </Card>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment-methods' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Payment Methods</h2>
            <Button
              onClick={handleAddPaymentMethod}
              loading={actionLoading === 'add-payment'}
              variant="outline"
              icon={Plus}
            >
              Add Payment Method
            </Button>
          </div>
          
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <CreditCard className="w-6 h-6 text-neutral-400" />
                    <div>
                      <p className="font-medium">
                        •••• •••• •••• {method.card.last4}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {method.card.brand.toUpperCase()} • Expires {method.card.exp_month}/{method.card.exp_year}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    loading={actionLoading === 'delete-payment'}
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 mb-4">No payment methods found</p>
              <Button
                onClick={handleAddPaymentMethod}
                loading={actionLoading === 'add-payment'}
                variant="primary"
                icon={Plus}
              >
                Add Your First Payment Method
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManager;
