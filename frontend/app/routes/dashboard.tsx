import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Plus, 
  Mic
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import StatsOverview from "~/components/dashboard/StatsOverview";
import PodcastCard from "~/components/dashboard/PodcastCard";
import TranslationStatus from "~/components/dashboard/TranslationStatus";
import EmptyState from "~/components/dashboard/EmptyState";

const mockUserAPI = {
  me: () => Promise.resolve({
    id: 1,
    full_name: "John Doe",
    email: "john@example.com",
    onboarding_completed: true
  })
};

const mockPodcastAPI = {
  list: () => Promise.resolve([
    {
      id: 1,
      title: "Tech Talk Daily",
      description: "Daily discussions about the latest in technology",
      original_language: "English",
      cover_image: "https://via.placeholder.com/150/4F46E5/FFFFFF?text=TT",
      episode_count: 45,
      created_date: "2024-01-15",
      updated_date: "2024-09-10"
    },
    {
      id: 2,
      title: "History Uncovered",
      description: "Exploring forgotten stories from the past",
      original_language: "English",
      cover_image: "https://via.placeholder.com/150/059669/FFFFFF?text=HU",
      episode_count: 28,
      created_date: "2024-02-20",
      updated_date: "2024-09-08"
    },
    {
      id: 3,
      title: "Mindful Moments",
      description: "Guided meditations and wellness tips",
      original_language: "English",
      cover_image: "https://via.placeholder.com/150/DC2626/FFFFFF?text=MM",
      episode_count: 67,
      created_date: "2024-03-10",
      updated_date: "2024-09-12"
    }
  ])
};

const mockTranslationAPI = {
  list: () => Promise.resolve([
    {
      id: 1,
      podcast_id: 1,
      target_language: "Spanish",
      status: "published",
      progress: 100,
      episode_count: 45,
      created_date: "2024-08-15",
      updated_date: "2024-09-10"
    },
    {
      id: 2,
      podcast_id: 1,
      target_language: "French",
      status: "in_progress",
      progress: 75,
      episode_count: 34,
      created_date: "2024-08-20",
      updated_date: "2024-09-08"
    },
    {
      id: 3,
      podcast_id: 2,
      target_language: "German",
      status: "published",
      progress: 100,
      episode_count: 28,
      created_date: "2024-08-25",
      updated_date: "2024-09-05"
    },
    {
      id: 4,
      podcast_id: 3,
      target_language: "Italian",
      status: "processing",
      progress: 45,
      episode_count: 30,
      created_date: "2024-09-01",
      updated_date: "2024-09-12"
    }
  ])
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [podcasts, setPodcasts] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userData, podcastsData, translationsData] = await Promise.all([
        mockUserAPI.me(),
        mockPodcastAPI.list(),
        mockTranslationAPI.list()
      ]);
      
      setUser(userData);
      setPodcasts(podcastsData);
      setTranslations(translationsData);

      if (userData && !userData.onboarding_completed && podcastsData.length === 0) {
        navigate("/OnboardingWelcome");
        return;
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          <div className="text-xl font-medium text-gray-600">Loading your podcasts...</div>
        </div>
      </div>
    );
  }

  const stats = {
    totalPodcasts: podcasts.length,
    totalLanguages: [...new Set(translations.map(t => t.target_language))].length,
    totalTranslations: translations.length,
    activeTranslations: translations.filter(t => t.status === 'published').length
  };

  return (
    <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-7xl mx-auto">

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-gray-600">
              {podcasts.length === 0 
                ? "Ready to globalize your first podcast?"
                : `You have ${stats.totalTranslations} translations across ${stats.totalLanguages} languages`
              }
            </p>
          </div>
          
<<<<<<< HEAD
<<<<<<< HEAD
          <Link to="/onboarding/rss-feed">
=======
          <Link to="/OnboardingRSSFeed">
>>>>>>> 90ec634 (update)
=======
          <Link to="/onboarding/rss-feed">
>>>>>>> 3e7630c (added extra pages)
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="w-5 h-5 mr-2" />
              Add New Podcast
            </Button>
          </Link>
        </motion.div>

        <StatsOverview stats={stats} />

        {podcasts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Card className="backdrop-blur-md bg-white/80 shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Mic className="w-5 h-5 text-blue-600" />
                        My Podcasts
                      </span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {podcasts.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {podcasts.map((podcast, index) => (
                      <PodcastCard 
                        key={podcast.id} 
                        podcast={podcast} 
                        translations={translations.filter(t => t.podcast_id === podcast.id)}
                        index={index}
                      />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div>
              <TranslationStatus translations={translations} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}