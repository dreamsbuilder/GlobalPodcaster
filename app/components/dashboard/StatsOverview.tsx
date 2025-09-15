import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { motion } from "framer-motion";
import { Mic, Globe, Languages, TrendingUp } from "lucide-react";

export default function StatsOverview({ stats }) {
  const statCards = [
    {
      title: "Podcasts",
      value: stats.totalPodcasts,
      icon: Mic,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100"
    },
    {
      title: "Languages",
      value: stats.totalLanguages,
      icon: Languages,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100"
    },
    {
      title: "Translations",
      value: stats.totalTranslations,
      icon: Globe,
      gradient: "from-teal-500 to-teal-600",
      bgGradient: "from-teal-50 to-teal-100"
    },
    {
      title: "Active",
      value: stats.activeTranslations,
      icon: TrendingUp,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <Card className="backdrop-blur-md bg-white/80 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgGradient} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.title}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}