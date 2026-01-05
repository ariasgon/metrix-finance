'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, X, Zap, Crown, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    period: 'forever',
    icon: Zap,
    features: [
      { name: 'Pool discovery', included: true },
      { name: 'Basic market metrics', included: true },
      { name: 'Up to 5 simulations/day', included: true },
      { name: 'Track 1 position', included: true },
      { name: 'Recently viewed pools', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Custom alerts', included: false },
      { name: 'API access', included: false },
      { name: 'Priority support', included: false },
    ],
    cta: 'Current Plan',
    popular: false,
    disabled: true,
  },
  {
    name: 'Pro',
    description: 'For serious DeFi investors',
    price: 19,
    period: 'month',
    icon: Crown,
    features: [
      { name: 'Pool discovery', included: true },
      { name: 'Advanced market metrics', included: true },
      { name: 'Unlimited simulations', included: true },
      { name: 'Track 25 positions', included: true },
      { name: 'Recently viewed pools', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom alerts', included: true },
      { name: 'API access', included: false },
      { name: 'Priority support', included: false },
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    disabled: false,
  },
  {
    name: 'Enterprise',
    description: 'For teams and institutions',
    price: 99,
    period: 'month',
    icon: Sparkles,
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Unlimited positions', included: true },
      { name: 'Team collaboration', included: true },
      { name: 'White-label options', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom alerts', included: true },
      { name: 'Full API access', included: true },
      { name: 'Priority support', included: true },
      { name: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
    disabled: false,
  },
];

const faqs = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and cryptocurrency payments including ETH, USDC, and USDT.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 14-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes, you can change your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the change will take effect at your next billing date.',
  },
];

export default function PricingPage() {
  const { setAuthModalOpen, setIsPro, isPro } = useStore();

  const handleUpgrade = (planName: string) => {
    if (planName === 'Pro') {
      setIsPro(true);
    }
    setAuthModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Choose the plan that best fits your DeFi investment needs. Upgrade anytime as your portfolio grows.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.name === 'Free' && !isPro || plan.name === 'Pro' && isPro;

          return (
            <Card
              key={plan.name}
              className={cn(
                'relative p-6 flex flex-col',
                plan.popular && 'border-primary ring-2 ring-primary/20'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'p-2 rounded-lg',
                  plan.popular ? 'bg-primary/20 text-primary' : 'bg-card-hover text-muted'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted">/{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted flex-shrink-0" />
                    )}
                    <span className={cn('text-sm', !feature.included && 'text-muted')}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                size="lg"
                className="w-full"
                disabled={isCurrentPlan}
                onClick={() => handleUpgrade(plan.name)}
              >
                {isCurrentPlan ? 'Current Plan' : plan.cta}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Compare Features</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium">Feature</th>
                  <th className="text-center p-4 text-sm font-medium">Free</th>
                  <th className="text-center p-4 text-sm font-medium text-primary">Pro</th>
                  <th className="text-center p-4 text-sm font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Pool Discovery', free: true, pro: true, enterprise: true },
                  { feature: 'Market Metrics', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
                  { feature: 'Simulations', free: '5/day', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Position Tracking', free: '1', pro: '25', enterprise: 'Unlimited' },
                  { feature: 'Recently Viewed', free: false, pro: true, enterprise: true },
                  { feature: 'Custom Alerts', free: false, pro: true, enterprise: true },
                  { feature: 'API Access', free: false, pro: false, enterprise: true },
                  { feature: 'Priority Support', free: false, pro: false, enterprise: true },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-border hover:bg-card-hover">
                    <td className="p-4 text-sm">{row.feature}</td>
                    <td className="p-4 text-center">
                      <FeatureValue value={row.free} />
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      <FeatureValue value={row.pro} />
                    </td>
                    <td className="p-4 text-center">
                      <FeatureValue value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.question} className="p-6">
              <h3 className="font-medium mb-2">{faq.question}</h3>
              <p className="text-sm text-muted">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16 p-12 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20">
        <h2 className="text-2xl font-bold mb-4">Ready to Optimize Your DeFi Returns?</h2>
        <p className="text-muted mb-6 max-w-xl mx-auto">
          Join thousands of DeFi investors using Metrix to discover high-performing pools and maximize their liquidity provision returns.
        </p>
        <Button size="lg" onClick={() => setAuthModalOpen(true)}>
          Get Started Free
        </Button>
      </div>
    </div>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-4 h-4 text-success mx-auto" />
    ) : (
      <X className="w-4 h-4 text-muted mx-auto" />
    );
  }
  return <span className="text-sm">{value}</span>;
}
