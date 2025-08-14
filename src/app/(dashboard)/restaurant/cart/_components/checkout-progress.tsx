"use client";

import { Check } from "lucide-react";

type Props = {
  currentStep: "cart" | "checkout" | "confirmation";
};

export function CheckoutProgress({ currentStep }: Props) {
  const steps = [
    { id: "cart", label: "Cart", completed: currentStep !== "cart" },
    {
      id: "checkout",
      label: "Checkout",
      completed: currentStep === "confirmation",
    },
    { id: "confirmation", label: "Confirmation", completed: false },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="flex items-center justify-center mb-8 w-full">
      <div className="relative flex items-center w-full max-w-3xl">
        <div className="absolute top-5 left-5 right-7 h-0.5 bg-gray-300" />

        <div
          className="absolute top-5 left-3 h-0.5 bg-green-500 transition-all duration-300 ease-in-out"
          style={{
            width:
              currentIndex === 0
                ? "0%"
                : currentIndex === 1
                ? "calc(50% - 20px)"
                : "calc(100% - 40px)",
          }}
        />

        <div className="relative flex justify-between w-full">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.completed;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-green-500 text-white"
                      : "bg-white border-2 border-gray-300 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-3 text-sm ${
                    isActive || isCompleted
                      ? "text-green-600 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
