"use client"

import { Package, XCircle, Clock, DollarSign, TrendingUp, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"

export default function StatsCards() {
  // Mock data for earnings chart
  const earningsData = [
    { month: "Jan", earnings: 800 },
    { month: "Feb", earnings: 950 },
    { month: "Mar", earnings: 1100 },
    { month: "Apr", earnings: 1200 },
    { month: "May", earnings: 1350 },
    { month: "Jun", earnings: 1200 },
  ]

  const stats = [
    {
      title: "Accepted Products",
      value: "147",
      subtitle: "Verified & Approved",
      icon: Package,
      gradient: "bg-gradient-to-br from-emerald-500/40 via-green-500/35 to-emerald-600/30",
      iconBg: "bg-emerald-500/20 backdrop-blur-sm border-emerald-300/30",
      iconColor: "text-emerald-700",
      glowColor: "shadow-emerald-500/20 hover:shadow-emerald-500/30",
      textColor: "text-emerald-800",
    },
    {
      title: "Rejected Products",
      value: "$2,340",
      subtitle: "Potential Loss",
      icon: XCircle,
      gradient: "bg-gradient-to-br from-emerald-500/40 via-green-500/35 to-emerald-600/30",
      iconBg: "bg-emerald-500/20 backdrop-blur-sm border-emerald-300/30",
      iconColor: "text-emerald-700",
      glowColor: "shadow-emerald-500/20 hover:shadow-emerald-500/30",
      textColor: "text-emerald-800",
    },
    {
      title: "Submitted Products",
      value: "23",
      subtitle: "Keep submitting to earn more!",
      icon: Clock,
      gradient: "bg-gradient-to-br from-emerald-500/40 via-green-500/35 to-emerald-600/30",
      iconBg: "bg-emerald-500/20 backdrop-blur-sm border-emerald-300/30",
      iconColor: "text-emerald-700",
      glowColor: "shadow-emerald-500/20 hover:shadow-emerald-500/30",
      textColor: "text-emerald-800",
    },
    {
      title: "Total Earnings",
      value: "$15,240",
      subtitle: "All submissions",
      icon: DollarSign,
      gradient: "bg-gradient-to-br from-emerald-500/40 via-green-500/35 to-emerald-600/30",
      iconBg: "bg-emerald-500/20 backdrop-blur-sm border-emerald-300/30",
      iconColor: "text-emerald-700",
      glowColor: "shadow-emerald-500/20 hover:shadow-emerald-500/30",
      textColor: "text-emerald-800",
      showChart: true,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border border-red-500">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`border border-white/50 shadow-lg ${stat.gradient} ${stat.glowColor} bg-green-100 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-green-100 from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <CardContent className=" relative z-10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm font-semibold text-gray-700">{stat.title}</p>
                    <Sparkles className="w-3 h-3 text-gray-500 animate-pulse" />
                  </div>
                  <p className={`text-2xl font-bold ${stat.textColor} mb-1 tracking-tight`}>{stat.value}</p>
                  <p className="text-sm text-gray-600 font-medium">{stat.subtitle}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl ${stat.iconBg} border flex items-center justify-center shadow-md ml-2 group-hover:scale-110 transition-all duration-300`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>

              {stat.showChart && (
                <div className="mt-3">
                  <div className="h-12 bg-white/30 rounded-lg p-2 backdrop-blur-sm border border-white/40 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={earningsData}>
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          stroke="rgba(34, 197, 94, 0.9)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <div className="flex items-center text-emerald-700 bg-emerald-100/60 px-2 py-1 rounded-lg backdrop-blur-sm border border-emerald-200/50">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span className="text-sm font-semibold">+12.5%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}