// Subscription tier feature mapping
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    features: [
      'Basic messaging (100 messages/day)',
      'Profile setup',
      'Mood logging (3 per day)',
      'Weather widget',
      'Daily questions',
      'Memory vault (5 photos)',
      'AI chat (3 questions/day)',
      'Basic goals (2 goals max)',
      'One-time video call trial (10 min)',
      'Lovable branding',
    ]
  },
  premium: {
    name: 'Premium',
    features: [
      'Everything in Free',
      'Unlimited messaging',
      'Unlimited mood logging',
      'Mood analytics & insights',
      'Unlimited calendar events & sync',
      'Unlimited relationship goals & tasks',
      'Unlimited memory vault',
      'Unlimited video calls',
      'Unlimited AI chat & advanced insights',
      'Partner support features',
      'Book recommendations',
      'Priority support',
      'Custom themes',
      'Export all data',
      'Ad-free experience',
      'No branding',
    ]
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const FEATURE_GATES = {
  // Free features (no gate needed)
  profile: { tier: 'free' as const, limit: null },
  weather: { tier: 'free' as const, limit: null },
  dailyQuestions: { tier: 'free' as const, limit: null },
  
  // Free with limits (upgradeable to premium)
  messaging: { tier: 'free' as const, limit: 100, premiumTier: 'premium' as const },
  moodLogging: { tier: 'free' as const, limit: 3, premiumTier: 'premium' as const },
  memoryVault: { tier: 'free' as const, limit: 5, premiumTier: 'premium' as const },
  loveAdvisor: { tier: 'free' as const, limit: 3, premiumTier: 'premium' as const },
  goals: { tier: 'free' as const, limit: 2, premiumTier: 'premium' as const },
  videoCalls: { tier: 'free' as const, limit: 1, duration: 10, premiumTier: 'premium' as const },
  
  // Premium features (all unlimited)
  calendarEvents: { tier: 'premium' as const, limit: null },
  moodAnalytics: { tier: 'premium' as const, limit: null },
  partnerSupport: { tier: 'premium' as const, limit: null },
  bookRecommendations: { tier: 'premium' as const, limit: null },
  unlimitedMemory: { tier: 'premium' as const, limit: null },
  unlimitedVideoCalls: { tier: 'premium' as const, limit: null },
  advancedAI: { tier: 'premium' as const, limit: null },
  customThemes: { tier: 'premium' as const, limit: null },
  dataExport: { tier: 'premium' as const, limit: null },
} as const;

export const hasFeatureAccess = (
  userTier: SubscriptionTier,
  feature: keyof typeof FEATURE_GATES
): boolean => {
  const tierOrder = { free: 0, premium: 1 };
  const featureGate = FEATURE_GATES[feature];
  return tierOrder[userTier] >= tierOrder[featureGate.tier];
};

export const getRequiredTierForFeature = (
  feature: keyof typeof FEATURE_GATES
): SubscriptionTier => {
  return FEATURE_GATES[feature].tier;
};

export const getFeatureLimit = (
  userTier: SubscriptionTier,
  feature: keyof typeof FEATURE_GATES
): number | null => {
  const featureGate = FEATURE_GATES[feature];
  
  // If user has higher tier than required, no limit
  const tierOrder = { free: 0, premium: 1 };
  if (tierOrder[userTier] > tierOrder[featureGate.tier]) {
    return null;
  }
  
  // If feature has a premium tier that removes limit
  if ('premiumTier' in featureGate && tierOrder[userTier] >= tierOrder[featureGate.premiumTier]) {
    return null;
  }
  
  return featureGate.limit;
};
