import React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { motion } from "framer-motion";
import { 
  ExternalLink, 
  Globe, 
  Play, 
  Pause, 
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function PodcastCard({ podcast, translations, index }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'paused': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'processing': return <Clock className="w-3 h-3" />;
      case 'error': return <AlertCircle className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="hover:shadow-md transition-all duration-300 border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {podcast.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {podcast.description || "No description available"}
                </p>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`border ${getStatusColor(podcast.status)}`}>
                    {getStatusIcon(podcast.status)}
                    <span className="ml-1 capitalize">{podcast.status}</span>
                  </Badge>
                  
                  {translations.length > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Globe className="w-3 h-3 mr-1" />
                      {translations.length} languages
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View RSS Feed
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Edit Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Remove Podcast
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {translations.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Recent translations:</span>
                <div className="flex gap-2">
                  {translations.slice(0, 3).map((translation, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline" 
                      className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                    >
                      {translation.target_language.toUpperCase()}
                    </Badge>
                  ))}
                  {translations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{translations.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}