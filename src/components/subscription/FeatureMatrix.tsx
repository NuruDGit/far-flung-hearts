import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Feature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  description?: string;
}

const features: Feature[] = [
  { name: 'Unlimited Messages', free: true, premium: true },
  { name: 'Photo & Video Sharing', free: '10/month', premium: true },
  { name: 'Voice & Video Calls', free: '30 min/month', premium: 'Unlimited' },
  { name: 'Memory Vault Storage', free: '100 MB', premium: '10 GB' },
  { name: 'Calendar Events', free: true, premium: true },
  { name: 'Shared Goals', free: false, premium: true },
  { name: 'Mood Tracking', free: '7 days', premium: 'Unlimited' },
  { name: 'AI Love Advisor', free: '5 questions/month', premium: 'Unlimited' },
  { name: 'Daily Questions', free: true, premium: true },
  { name: 'Relationship Games', free: 'Basic', premium: 'All Games' },
  { name: 'Custom Themes', free: false, premium: true },
  { name: 'Priority Support', free: false, premium: true },
];

export const FeatureMatrix: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const displayedFeatures = expanded ? features : features.slice(0, 6);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-card border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 border-b">
          <div className="font-semibold">Feature</div>
          <div className="font-semibold text-center">Free</div>
          <div className="font-semibold text-center">Premium</div>
        </div>

        {/* Features */}
        <AnimatePresence mode="popLayout">
          {displayedFeatures.map((feature, index) => (
            <motion.div
              key={feature.name}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-3 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/20 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-medium">{feature.name}</span>
                {feature.description && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center">
                {renderFeatureValue(feature.free)}
              </div>

              <div className="flex items-center justify-center">
                {renderFeatureValue(feature.premium)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Expand/Collapse */}
        <div className="p-4 bg-muted/10">
          <Button
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="w-full"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show All {features.length} Features
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

function renderFeatureValue(value: boolean | string) {
  if (value === true) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center"
      >
        <Check className="h-4 w-4 text-success" />
      </motion.div>
    );
  }

  if (value === false) {
    return (
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
        <X className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return <span className="text-sm text-muted-foreground">{value}</span>;
}
