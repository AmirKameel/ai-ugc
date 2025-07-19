"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingSpinnerProps {
  title: string;
  subtitle?: string;
  steps: string[];
}

export function LoadingSpinner({ title, subtitle, steps }: LoadingSpinnerProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return 0; // Loop back to start
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-fuchsia-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 bg-background rounded-full" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 text-sm"
                initial={{ opacity: 0.5 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0.5,
                  scale: index === currentStep ? 1.02 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex-shrink-0">
                  {index < currentStep ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : index === currentStep ? (
                    <Loader2 className="h-4 w-4 animate-spin text-fuchsia-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
                <span className={index <= currentStep ? "text-foreground" : "text-muted-foreground"}>
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}