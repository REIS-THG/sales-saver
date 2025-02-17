
export const subscriptionPlans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "Up to 5 deals",
      "1 deal analysis per month",
      "1 saved report",
      "Basic deal tracking",
      "Email support"
    ],
    limitations: [
      "Limited analytics",
      "Limited AI-powered insights",
      "Limited custom fields"
    ]
  },
  {
    name: "Pro",
    price: "30",
    billingPeriod: "per user/month",
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    description: "For growing sales teams",
    features: [
      "Unlimited deals",
      "Unlimited deal analysis",
      "Unlimited saved reports",
      "Advanced analytics",
      "Priority support",
      "Custom fields",
      "AI-powered insights",
      "Team collaboration",
      "Export capabilities"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Custom contract terms",
      "Dedicated account manager",
      "Custom integrations",
      "Enhanced security features",
      "SSO integration",
      "Custom training sessions",
      "SLA guarantees",
      "Audit logs",
      "Volume discounts"
    ],
    contact: true
  }
];
