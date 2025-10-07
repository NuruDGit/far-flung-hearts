export const STRIPE_CONFIG = {
  free: { 
    product_id: null, 
    price_id: null 
  },
  premium_monthly: { 
    product_id: import.meta.env.VITE_STRIPE_PREMIUM_PRODUCT_ID,
    price_id: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID
  },
  premium_annual: { 
    product_id: import.meta.env.VITE_STRIPE_PREMIUM_PRODUCT_ID,
    price_id: import.meta.env.VITE_STRIPE_PREMIUM_ANNUAL_PRICE_ID
  },
} as const;

export type SubscriptionTier = 'free' | 'premium_monthly' | 'premium_annual';
