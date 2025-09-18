import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";
import { Globe, Plus, Mic, Languages, Zap } from "lucide-react";

export default function EmptyState() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <Card className="backdrop-blur-md bg-white/80 shadow-lg border-0">
        <CardContent className="py-16 px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Globe className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Go Global?
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Add your first podcast to start reaching audiences worldwide. 
              We'll help you translate and distribute your content in multiple languages.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Add Podcast</h3>
                <p className="text-sm text-gray-600">Submit your RSS feed</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Languages className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Choose Languages</h3>
                <p className="text-sm text-gray-600">Select target languages</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Auto-Translate</h3>
                <p className="text-sm text-gray-600">Let AI handle the rest</p>
              </div>
            </div>

            <Link to="/OnboardingRSSFeed">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Podcast
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}