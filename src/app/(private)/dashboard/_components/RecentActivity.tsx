/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  UserPlus, 
  ShoppingCart, 
  CreditCard, 
  Package,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
  metadata?: any;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_signup":
        return <UserPlus className="h-4 w-4" />;
      case "order_placed":
        return <ShoppingCart className="h-4 w-4" />;
      case "subscription":
        return <CreditCard className="h-4 w-4" />;
      case "voucher":
        return <Package className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      default:
        return null ;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || !mounted) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full gap-0">
      <CardHeader className="">
        <CardTitle className="text-sm py-0  font-semibold flex items-center gap-2">
          <div className="h-2 w-2 bg-yellow-700 rounded-full animate-pulse" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-64 overflow-y-auto space-y-0 ">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-xs">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start space-x-1 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getActivityIcon(activity.type)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  {activity.status && (
                    <Badge
                      className={`${getStatusColor(activity.status)} text-xs`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(activity.status)}
                        {activity.status}
                      </div>
                    </Badge>
                  )}
                </div>
                <p className="text-[12px] text-gray-600 mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 italic">
                    {mounted ? formatDate(activity.timestamp) : "Loading..."} •{" "}
                    {mounted ? formatTime(activity.timestamp) : "..."}
                  </p>
                  {activity.amount && (
                    <span className="text-xs font-medium text-green-600">
                      +{activity.amount.toLocaleString()} RWF
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
}