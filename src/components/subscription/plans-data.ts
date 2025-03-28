
export const subscriptionPlans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started with Sales Saver",
    features: [
      "Up to 5 deals in your pipeline",
      "1 AI-powered deal analysis per month",
      "1 saved report template",
      "Basic deal tracking and management",
      "Email support within 48 hours",
      "Deal table view",
      "Manual deal entry"
    ],
    limitations: [
      "Limited to 5 deals in your pipeline",
      "Only 1 AI analysis per month",
      "No custom fields",
      "No document generation",
      "No team collaboration features"
    ]
  },
  {
    name: "Pro",
    price: "30",
    billingPeriod: "per user/month",
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    productId: "prod_RnC56ZM4DtYl8u", // Added correct product ID
    directLink: "https://buy.stripe.com/28o3eSbhd6W40z63cc",
    description: "For growing sales teams and serious professionals",
    features: [
      "Unlimited deals in your pipeline",
      "Unlimited AI-powered deal analyses",
      "Unlimited saved report templates",
      "Advanced analytics and insights",
      "Priority support within 24 hours",
      "Custom fields for deal tracking",
      "AI-powered insights and recommendations",
      "Team collaboration tools",
      "Export capabilities to CSV/Excel",
      "Document generation (contracts, proposals)",
      "Multiple pipeline views (table, kanban)",
      "Deal scoring and prioritization",
      "Email templates for follow-ups",
      "Bulk import/export of deals"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with complex needs",
    features: [
      "Everything in Pro plan",
      "Custom contract terms",
      "Dedicated account manager",
      "Custom API integrations",
      "Enhanced security features",
      "SSO integration",
      "Custom training sessions",
      "SLA guarantees with 4hr response",
      "Detailed audit logs",
      "Volume discounts for large teams",
      "Custom reporting",
      "Advanced user permissions",
      "White-label options",
      "On-premise deployment option",
      "24/7 phone and email support"
    ],
    contact: true
  }
];

export const usageLimits = {
  free: {
    deals: 5,
    aiAnalyses: 1,
    savedReports: 1,
    documentGeneration: 0
  },
  pro: {
    deals: -1, // unlimited
    aiAnalyses: -1, // unlimited
    savedReports: -1, // unlimited
    documentGeneration: -1 // unlimited
  },
  enterprise: {
    deals: -1, // unlimited
    aiAnalyses: -1, // unlimited
    savedReports: -1, // unlimited
    documentGeneration: -1 // unlimited
  }
};
