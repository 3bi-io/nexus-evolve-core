import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 relative">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    index < currentStep
                      ? "bg-success border-success text-success-foreground"
                      : index === currentStep
                      ? "bg-primary border-primary text-primary-foreground animate-pulse-glow"
                      : "bg-muted border-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className={cn(
                  "text-xs mt-2 text-center",
                  index <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step}
              </motion.p>
            </div>

            {index < steps.length - 1 && (
              <div className="absolute top-5 left-[50%] w-full h-0.5 -z-10">
                <div className="w-full h-full bg-muted-foreground/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: index < currentStep ? "100%" : "0%" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-success"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <span className="absolute text-xl font-bold">{Math.round(percentage)}%</span>
    </div>
  );
}
