import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Link } from "react-router-dom";
import { Globe, Mic, Eye, EyeOff, CheckCircle, User, Mail, Lock } from "lucide-react";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordStrength = () => {
    const { password } = formData;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength === 0) return "bg-light-gray";
    if (strength <= 2) return "bg-destructive";
    if (strength === 3) return "bg-soft-orange";
    return "bg-mint-green";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            <div className="flex items-center gap-1">
              <Globe color="#6a5aba" className="w-7 h-7" />
            </div>
            Global Podcaster
          </Link>
          <p className="text-black/80">Welcome back to your global journey</p>
        </div>

        {/* Sign Up Card */}
        <Card className="backdrop-blur-md bg-white/80 shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-charcoal">Create Account</CardTitle>
            <CardDescription className="text-medium-gray">
              Join thousands of podcasters going global
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-charcoal">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-medium-gray" />
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10 h-12 transition-smooth focus:ring-2 focus:ring-ocean-blue"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-charcoal">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-medium-gray" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 h-12 transition-smooth focus:ring-2 focus:ring-ocean-blue"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-charcoal">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-medium-gray" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 transition-smooth focus:ring-2 focus:ring-ocean-blue"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-medium-gray hover:text-charcoal transition-smooth"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-smooth ${
                          i < passwordStrength() ? getStrengthColor() : "bg-light-gray"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-medium-gray">
                    Password strength: {["Very weak", "Weak", "Fair", "Good", "Strong"][passwordStrength()]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-charcoal">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-medium-gray" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 transition-smooth focus:ring-2 focus:ring-ocean-blue"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-medium-gray hover:text-charcoal transition-smooth"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button size="lg" className="w-full h-12">
              Create Account
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-medium-gray">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-ocean-blue hover:text-soft-teal transition-smooth">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-xs text-white/60 text-center">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="text-white/80 hover:text-white transition-smooth">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-white/80 hover:text-white transition-smooth">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;