import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { motion } from "framer-motion";
import { 
  User as UserIcon, 
  Mic, 
  Languages, 
  Shield, 
  Bell,
  Upload,
  Trash2,
  CheckCircle
} from "lucide-react";

// Mock API functions
const User = {
  me: () => Promise.resolve({
    id: 1,
    full_name: "John Doe",
    email: "john@example.com",
    onboarding_completed: true,
    preferred_languages: ['es', 'fr'],
    notification_preferences: { email_alerts: true },
    voice_sample_url: null
  }),
  updateMyUserData: (data) => Promise.resolve({ 
    success: true, 
    message: "Settings updated successfully",
    data: data
  })
};

const Settings = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    full_name: '',
    preferred_languages: [],
    notification_preferences: { email_alerts: true }
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        preferred_languages: userData.preferred_languages || [],
        notification_preferences: userData.notification_preferences || { email_alerts: true }
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      setSaveMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (section) => {
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      const response = await User.updateMyUserData(formData);
      
      if (response.success) {
        setSaveMessage({ type: 'success', text: `${section} settings saved successfully!` });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveMessage({ type: '', text: '' });
        }, 3000);
        
        // Refresh data to ensure we have the latest from server
        await loadUserData();
      } else {
        setSaveMessage({ type: 'error', text: response.message || 'Failed to save settings' });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const availableLanguages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

  const toggleLanguage = (languageCode) => {
    const current = formData.preferred_languages || [];
    const updated = current.includes(languageCode)
      ? current.filter(lang => lang !== languageCode)
      : [...current, languageCode];
    
    setFormData(prev => ({ ...prev, preferred_languages: updated }));
  };

  const handleVoiceUpload = () => {
    // Mock voice upload functionality
    setSaveMessage({ type: 'info', text: 'Voice upload functionality would be implemented here' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          <div className="text-xl font-medium text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and translation preferences</p>
          
          {/* Save message notification */}
          {saveMessage.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              saveMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : saveMessage.type === 'error'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {saveMessage.text}
            </div>
          )}
        </motion.div>

        <div className="grid gap-8">
          {/* Profile Settings */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Card className="backdrop-blur-md bg-white/80 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email}
                      disabled
                      className="mt-1 bg-gray-50 text-gray-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('Profile')}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Voice Management */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="backdrop-blur-md bg-white/80 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-purple-600" />
                  Voice Sample
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user?.voice_sample_url ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Voice sample uploaded</p>
                        <p className="text-sm text-green-700">Your voice is ready for translation</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={handleVoiceUpload}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Replace
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No voice sample</h3>
                    <p className="text-gray-600 mb-4">Upload a 1-5 minute audio sample to enable voice cloning</p>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={handleVoiceUpload}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Voice Sample
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Language Preferences */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="backdrop-blur-md bg-white/80 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-teal-600" />
                  Language Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the languages you want to translate your podcasts into
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {availableLanguages.map((language) => (
                      <div
                        key={language.code}
                        onClick={() => toggleLanguage(language.code)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.preferred_languages?.includes(language.code)
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-medium text-sm">{language.name}</div>
                          <div className="text-xs text-gray-500 uppercase">{language.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Selected: <span className="font-medium">{formData.preferred_languages?.length || 0}</span> languages
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleSave('Language')}
                    disabled={isSaving}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {isSaving ? "Saving..." : "Save Languages"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="backdrop-blur-md bg-white/80 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Get notified when translations are completed</p>
                  </div>
                  <Switch
                    checked={formData.notification_preferences?.email_alerts}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        notification_preferences: { ...prev.notification_preferences, email_alerts: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('Notification')}
                    disabled={isSaving}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Settings;