import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const checks = [
    { label: "At least 12 characters", test: password.length >= 12 },
    { label: "One uppercase letter", test: /[A-Z]/.test(password) },
    { label: "One lowercase letter", test: /[a-z]/.test(password) },
    { label: "One number", test: /[0-9]/.test(password) },
    { label: "One special character", test: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedChecks = checks.filter((c) => c.test).length;
  const strength = passedChecks === 0 ? 0 : (passedChecks / checks.length) * 100;

  const getStrengthColor = () => {
    if (strength < 40) return "bg-destructive";
    if (strength < 80) return "bg-warning";
    return "bg-success";
  };

  const getStrengthLabel = () => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Medium";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Password Strength</span>
          <span className={`font-semibold ${strength >= 80 ? 'text-success' : strength >= 40 ? 'text-warning' : 'text-destructive'}`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getStrengthColor()} transition-colors`}
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {checks.map((check, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 text-xs"
          >
            {check.test ? (
              <Check className="w-4 h-4 text-success flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={check.test ? "text-foreground" : "text-muted-foreground"}>
              {check.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
