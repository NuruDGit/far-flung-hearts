export const STRIPE_CONFIG = {
  free: { 
    product_id: null, 
    price_id: null 
  },
  premium: { 
    product_id: import.meta.env.VITE_STRIPE_PREMIUM_PRODUCT_ID,
    price_id: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID
  },
  super_premium: { 
    product_id: import.meta.env.VITE_STRIPE_SUPER_PREMIUM_PRODUCT_ID,
    price_id: import.meta.env.VITE_STRIPE_SUPER_PREMIUM_PRICE_ID
  },
} as const;

export type SubscriptionTier = keyof typeof STRIPE_CONFIG;
