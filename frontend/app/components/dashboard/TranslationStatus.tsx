import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Languages, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Globe
} from "lucide-react";

export default function TranslationStatus({ translations }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending' };
      case 'fetched':
        return { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Fetched', animate: true };
      case 'transcribed':
        return { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Transcribed', animate: true };
      case 'translated':
        return { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Translated', animate: true };
      case 'synthesized':
        return { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Synthesized', animate: true };
      case 'published':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', text: 'Published' };
      case 'error':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Error' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  const recentTranslations = translations
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <Card className="backdrop-blur-md bg-white/80 shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-purple-600" />
            Translation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTranslations.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No translations yet</p>
              <p className="text-sm text-gray-400">
                Add a podcast to start translating
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTranslations.map((translation, index) => {
                const statusConfig = getStatusConfig(translation.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={translation.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${statusConfig.bg} rounded-full flex items-center justify-center`}>
                        <StatusIcon 
                          className={`w-4 h-4 ${statusConfig.color} ${statusConfig.animate ? 'animate-spin' : ''}`} 
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {translation.target_language.toUpperCase()} Translation
                        </div>
                        <div className="text-xs text-gray-500">
                          {translation.episode_count || 0} episodes
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${statusConfig.bg} ${statusConfig.color} border-0 text-xs`}
                    >
                      {statusConfig.text}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}