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
  RefreshCw
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
    
    // Simulate API calls to check system status
    try {
      // In a real implementation, you would make actual API calls here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setServices(prevServices => 
        prevServices.map(service => ({
          ...service,
          status: Math.random() > 0.1 ? "operational" : "degraded", // 90% uptime simulation
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            <CardTitle className="text-lg font-semibold">System Status</CardTitle>
          </div>
          <button
            onClick={checkSystemStatus}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Overall Status:</span>
          {getStatusBadge(overallStatus)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-gray-500">
                      Last checked: {service.lastChecked.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {service.responseTime && (
                    <span className="text-xs text-gray-500">
                      {service.responseTime}ms
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {getStatusIcon(service.status)}
                    {getStatusBadge(service.status)}
                  </div>
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