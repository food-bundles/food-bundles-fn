/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface StatItem {
  label: string;
  value: number;
  total: number;
  color: string;
  trend?: "up" | "down" | "stable";
}

interface QuickStatsProps {
  stats: StatItem[];
  loading?: boolean;
}

export function QuickStats({ stats, loading = false }: QuickStatsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="h-2 bg-gray-200 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "➡️";
      default:
        return "";
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "stable":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat, index) => {
          const percentage = (stat.value / stat.total) * 100;
          
          return (
            <div
              key={stat.label}
              className="space-y-2"
              style={{
                animation: `slideInLeft 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {stat.label}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {stat.value}/{stat.total}
                  </Badge>
                  {stat.trend && (
                    <span className={`text-xs ${getTrendColor(stat.trend)}`}>
                      {getTrendIcon(stat.trend)}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{
                    background: `linear-gradient(to right, ${stat.color} 0%, ${stat.color}80 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{percentage.toFixed(1)}%</span>
                  <span className={getTrendColor(stat.trend)}>
                    {stat.trend && `${getTrendIcon(stat.trend)} ${stat.trend}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
      
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Card>
  );
}