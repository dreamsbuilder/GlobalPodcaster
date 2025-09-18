import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  ArrowRight, 
  Copy, 
  ExternalLink,
  Globe,
  Mic,
  Languages,
  Rss
} from "lucide-react";

// Mock API functions
const User = {
  me: () => Promise.resolve({
    id: 1,
    full_name: "John Doe",
    email: "john@example.com",
    onboarding_completed: true,
    preferred_languages: ['es', 'fr', 'de'],
    voice_sample_url: 'https://storage.example.com/voice-samples/sample.mp3'
  })
};

const Podcast = {
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
    }
  ])
};

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [podcast, setPodcast] = useState(null);
  const [generatedFeeds, setGeneratedFeeds] = useState([]);

  useEffect(() => {
    const loadCompletionData = async () => {
      try {
        const [userData, podcastsData] = await Promise.all([
          User.me(),
          Podcast.list()
        ]);
        
        setUser(userData);
        if (podcastsData.length > 0) {
          setPodcast(podcastsData[0]);
          generateTranslatedFeeds(podcastsData[0], userData.preferred_languages || []);
        }
      } catch (error) {
        console.error("Error loading completion data:", error);
      }
    };

    loadCompletionData();
  }, []);

  const generateTranslatedFeeds = (podcastData, languages) => {
    const feeds = languages.map(langCode => ({
      language: langCode,
      url: `https://feeds.globalpodcaster.com/${podcastData.id}-${langCode}.xml`,
      name: getLanguageName(langCode)
    }));
    setGeneratedFeeds(feeds);
  };

  const getLanguageName = (code) => {
    const languages = {
      'es': 'Spanish',
      'fr': 'French', 
      'de': 'German',
      'pt': 'Portuguese',
      'it': 'Italian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'ru': 'Russian',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'pl': 'Polish',
      'tr': 'Turkish'
    };
    return languages[code] || code.toUpperCase();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const completionSteps = [
    {
      icon: Rss,
      title: "RSS Feed Added",
      description: podcast?.title || "Your podcast",
      status: "complete"
    },
    {
      icon: Mic,
      title: "Voice Sample",
      description: user?.voice_sample_url ? "Uploaded successfully" : "Skipped for now",
      status: user?.voice_sample_url ? "complete" : "skipped"
    },
    {
      icon: Languages,
      title: "Target Languages",
      description: `${user?.preferred_languages?.length || 0} languages selected`,
      status: "complete"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        <Card className="backdrop-blur-md bg-white/80 shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-green-50 to-blue-50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900">
              Setup Complete! 🎉
            </CardTitle>
            <p className="text-lg text-gray-600 mt-2">
              Your podcast is ready for global distribution
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8 px-8 pb-8">
            {/* Setup Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              {completionSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="text-center p-4 rounded-xl bg-white shadow-sm border"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    step.status === 'complete' 
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.status === 'complete' && (
                    <Badge className="mt-2 bg-green-100 text-green-700">Complete</Badge>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Generated RSS Feeds */}
            {generatedFeeds.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Your Translated RSS Feeds
                </h3>
                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                  {generatedFeeds.map((feed, index) => (
                    <div
                      key={feed.language}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{feed.name}</p>
                        <p className="text-sm text-gray-500 font-mono">{feed.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(feed.url)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(feed.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  ℹ️ These feeds will become active once your first episodes are translated (usually within 24-48 hours)
                </p>
              </motion.div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-3">What happens next?</h4>
              <div className="space-y-2 text-blue-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">We'll fetch your latest episodes automatically</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Episodes will be transcribed and translated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Voice synthesis will create translated audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Translated episodes will be published to RSS feeds</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-center"
            >
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                Monitor your translation progress and manage your global podcast distribution
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}