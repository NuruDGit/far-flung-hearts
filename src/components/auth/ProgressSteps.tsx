import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

export const ProgressSteps = ({ currentStep, steps }: ProgressStepsProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  index < currentStep
                    ? "bg-success text-success-foreground"
                    : index === currentStep
                    ? "bg-love-heart text-white"
                    : "bg-muted text-muted-foreground"
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
              <span className={`text-xs font-medium ${
                index <= currentStep ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-muted mx-2">
                <motion.div
                  className="h-full bg-love-heart"
                  initial={{ width: "0%" }}
                  animate={{ width: index < currentStep ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
