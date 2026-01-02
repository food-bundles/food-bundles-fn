"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubMetric {
  label: string;
  value: number;
  color: string;
}

interface EnhancedMetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: LucideIcon;
  color: string;
  suffix?: string;
  loading?: boolean;
  subMetrics?: SubMetric[];
}

export function EnhancedMetricCard({
  title,
  value,
  previousValue,
  icon: Icon,
  color,
  suffix = "",
  loading = false,
  subMetrics = [],
}: EnhancedMetricCardProps) {
  const percentageChange = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0;
  const isPositive = percentageChange >= 0;

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          {subMetrics.length > 0 && (
            <div className="mt-4 space-y-2">
              {subMetrics.map((_, index) => (
                <div key={index} className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`absolute inset-0 bg-linear-to-br ${color} opacity-5`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="">
              <p className="text-sm font-bold text-gray-900">
                {value.toLocaleString()}{suffix}
              </p>
              {previousValue !== undefined && (
                <div className={`flex  items-center text-xs ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(percentageChange).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full bg-linear-to-br ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Sub-metrics */}
        {subMetrics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <TooltipProvider>
              <div className="grid grid-cols-2 gap-2">
                {subMetrics.map((subMetric, index) => {
                  

                  return (
                    <div key={index} className="flex justify-between items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-gray-500 cursor-help truncate">
                            <span className="hidden lg:inline">{subMetric.label}</span>
                            <span className="lg:hidden">{subMetric.label}</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{subMetric.label}: {subMetric.value.toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`text-xs ml-1 font-semibold ${subMetric.color} cursor-help`}>
                           {subMetric.value.toLocaleString()}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                         <p>{subMetric.label}:  {subMetric.value.toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}