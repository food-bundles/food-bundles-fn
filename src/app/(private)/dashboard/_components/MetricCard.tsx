"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: LucideIcon;
  color: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  previousValue,
  icon: Icon,
  color,
  prefix = "",
  suffix = "",
  loading = false,
}: MetricCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isIncreasing, setIsIncreasing] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, value);
      setAnimatedValue(Math.floor(current));

      if (step >= steps || current >= value) {
        setAnimatedValue(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, loading]);

  useEffect(() => {
    if (previousValue !== undefined) {
      setIsIncreasing(value >= previousValue);
    }
  }, [value, previousValue]);

  const percentageChange = previousValue 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 py-2">
      <div className={`absolute inset-0 bg-linear-to-br ${color} opacity-5`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <h3 className="text-2xl font-bold text-gray-900">
                  {prefix}{animatedValue.toLocaleString()}{suffix}
                </h3>
              )}
              {previousValue !== undefined && !loading && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isIncreasing
                      ? "text-green-700 bg-green-100"
                      : "text-red-700 bg-red-100"
                  }`}
                >
                  {isIncreasing ? "+" : ""}{percentageChange.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full bg-linear-to-br ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}