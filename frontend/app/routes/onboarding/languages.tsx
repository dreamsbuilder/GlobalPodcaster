import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { motion } from "framer-motion";
import { 
  Languages, 
  ArrowRight, 
  ArrowLeft, 
  Search,
  Globe,
  CheckCircle
} from "lucide-react";

// Mock User API
const User = {
  updateMyUserData: async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: "User data updated successfully"
    };
  }
};

export default function OnboardingLanguages() {
  const navigate = useNavigate();
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const availableLanguages = [
    { code: 'es', name: 'Spanish', flag: '🇪🇸', speakers: '500M+' },
    { code: 'fr', name: 'French', flag: '🇫🇷', speakers: '280M+' },
    { code: 'de', name: 'German', flag: '🇩🇪', speakers: '100M+' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', speakers: '260M+' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', speakers: '65M+' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', speakers: '125M+' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', speakers: '77M+' },
    { code: 'zh', name: 'Chinese (Mandarin)', flag: '🇨🇳', speakers: '918M+' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', speakers: '310M+' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', speakers: '600M+' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', speakers: '258M+' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', speakers: '24M+' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', speakers: '10M+' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', speakers: '5M+' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱', speakers: '45M+' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', speakers: '80M+' }
  ];

  const filteredLanguages = availableLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLanguage = (languageCode) => {
    setSelectedLanguages(prev =>
      prev.includes(languageCode)
        ? prev.filter(code => code !== languageCode)
        : [...prev, languageCode]
    );
  };

  const handleContinue = async () => {
    setIsSaving(true);
    
    try {
      // Save selected languages to user profile
      await User.updateMyUserData({ 
        preferred_languages: selectedLanguages,
        onboarding_completed: true
      });
      
      // Navigate to completion page
      navigate("/onboarding/complete");
    } catch (error) {
      console.error("Error saving languages:", error);
    }
    
    setIsSaving(false);
  };

  const getSelectedLanguageNames = () => {
    return selectedLanguages
      .map(code => availableLanguages.find(lang => lang.code === code)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        <Card className="backdrop-blur-md bg-white/80 shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Languages className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
              Choose Your Target Languages
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Select the languages you want to translate your podcast into
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search languages..."
                className="pl-10 h-12"
              />
            </div>

            {/* Selected Languages Summary */}
            {selectedLanguages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-teal-50 border border-teal-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-teal-900">
                    {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <p className="text-sm text-teal-800">
                  {getSelectedLanguageNames()}
                </p>
              </motion.div>
            )}

            {/* Language Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredLanguages.map((language, index) => (
                <motion.div
                  key={language.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => toggleLanguage(language.code)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedLanguages.includes(language.code)
                      ? 'border-teal-500 bg-teal-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {language.name}
                        </h3>
                        <p className="text-xs text-gray-500 uppercase">
                          {language.code}
                        </p>
                      </div>
                    </div>
                    {selectedLanguages.includes(language.code) && (
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    {language.speakers} speakers
                  </Badge>
                </motion.div>
              ))}
            </div>

            {filteredLanguages.length === 0 && (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No languages found matching "{searchTerm}"</p>
              </div>
            )}

            {/* Popular Combinations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Popular combinations:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Global Reach', codes: ['es', 'fr', 'de', 'pt'] },
                  { name: 'Asian Markets', codes: ['zh', 'ja', 'ko', 'hi'] },
                  { name: 'European Focus', codes: ['fr', 'de', 'it', 'nl'] }
                ].map((combo) => (
                  <Button
                    key={combo.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLanguages(combo.codes)}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    {combo.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/onboarding/voice-sample")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <Button
                onClick={handleContinue}
                disabled={selectedLanguages.length === 0 || isSaving}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 flex items-center gap-2 px-8"
              >
                {isSaving ? "Saving..." : "Complete Setup"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}