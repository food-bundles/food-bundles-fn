/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wifi, 
  Database, 
  Server, 
  Globe,
} from "lucide-react";

interface SystemStatusProps {}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  responseTime?: number;
  lastChecked: Date;
  icon: React.ComponentType<any>;
}

export function SystemStatus({}: SystemStatusProps) {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "API Gateway",
      status: "operational",
      responseTime: 120,
      lastChecked: new Date(),
      icon: Server
    },
    {
      name: "Database",
      status: "operational", 
      responseTime: 45,
      lastChecked: new Date(),
      icon: Database
    },
    {
      name: "WebSocket",
      status: "operational",
      responseTime: 30,
      lastChecked: new Date(),
      icon: Wifi
    },
    {
      name: "External APIs",
      status: "operational",
      responseTime: 200,
      lastChecked: new Date(),
      icon: Globe
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSystemStatus = async () => {
    setIsRefreshing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setServices(prevServices => 
        prevServices.map(service => ({
          ...service,
          status: Math.random() > 0.1 ? "operational" : "degraded",
          responseTime: Math.floor(Math.random() * 300) + 50,
          lastChecked: new Date()
        }))
      );
    } catch (error) {
      console.error("Error checking system status:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Check status every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "degraded":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "down":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Degraded</Badge>;
      case "down":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Down</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  const overallStatus = services.every(s => s.status === "operational") 
    ? "operational" 
    : services.some(s => s.status === "down") 
    ? "down" 
    : "degraded";

  return (
    <Card>
      <CardHeader >
        <div className="flex gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            <CardTitle className="text-lg font-semibold">System Status</CardTitle>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Overall Status:</span>
          {getStatusBadge(overallStatus)}
        </div>
        </div>
      </CardHeader>
      <CardContent className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className="w-4 h-4 text-gray-600" />
                  <p className="font-medium text-xs">{service.name}</p>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {getStatusIcon(service.status)}
                  {getStatusBadge(service.status)}
                </div>
                <div className="text-center">
                  {service.responseTime && (
                    <span className="text-xs text-gray-500">
                      {service.responseTime}ms
                    </span>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {service.lastChecked.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Health Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Uptime</p>
              <p className="text-sm font-semibold text-green-600">99.9%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Response</p>
              <p className="text-sm font-semibold text-blue-600">
                {Math.round(services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / services.length)}ms
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}