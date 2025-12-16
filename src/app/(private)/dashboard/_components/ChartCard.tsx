/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ChartCardProps {
  title: string;
  data: ChartDataPoint[];
  type: "bar" | "line" | "pie";
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function ChartCard({ title, data, type, loading = false, trend }: ChartCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium">{item.value.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 40}
            x2="400"
            y2={i * 40}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}
        
        {/* Data line */}
        <polyline
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = 200 - (item.value / maxValue) * 180;
            return `${x},${y}`;
          }).join(' ')}
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            animation: 'drawLine 2s ease-out forwards'
          }}
        />
        
        {/* Area fill */}
        <polygon
          fill="url(#lineGradient)"
          points={`0,200 ${data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = 200 - (item.value / maxValue) * 180;
            return `${x},${y}`;
          }).join(' ')} 400,200`}
          style={{
            opacity: 0,
            animation: 'fadeIn 2s ease-out 1s forwards'
          }}
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 400;
          const y = 200 - (item.value / maxValue) * 180;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#3B82F6"
              style={{
                opacity: 0,
                animation: `fadeIn 0.5s ease-out ${1.5 + index * 0.1}s forwards`
              }}
            />
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg className="w-48 h-48 transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="96"
                  cy="96"
                  r="80"
                  fill="transparent"
                  stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
                  strokeWidth="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                />
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="absolute -right-32 top-0 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
                />
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {trend && (
            <Badge className={trend.isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {type === "bar" && renderBarChart()}
        {type === "line" && renderLineChart()}
        {type === "pie" && renderPieChart()}
      </CardContent>
      
      <style jsx>{`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  );
}