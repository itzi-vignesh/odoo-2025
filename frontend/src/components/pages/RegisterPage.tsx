import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegisterPageProps {
  onRegister: (data: any) => void;
  onNavigateToLogin: () => void;
  isLoading?: boolean;
  error?: string;
}

export function RegisterPage({ onRegister, onNavigateToLogin, isLoading, error }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    bio: "",
    availability: "available",
    avatar: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [currentSkillOffered, setCurrentSkillOffered] = useState("");
  const [currentSkillWanted, setCurrentSkillWanted] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkillOffered = () => {
    if (currentSkillOffered.trim() && !skillsOffered.includes(currentSkillOffered.trim())) {
      setSkillsOffered(prev => [...prev, currentSkillOffered.trim()]);
      setCurrentSkillOffered("");
    }
  };

  const addSkillWanted = () => {
    if (currentSkillWanted.trim() && !skillsWanted.includes(currentSkillWanted.trim())) {
      setSkillsWanted(prev => [...prev, currentSkillWanted.trim()]);
      setCurrentSkillWanted("");
    }
  };

  const removeSkillOffered = (skill: string) => {
    setSkillsOffered(prev => prev.filter(s => s !== skill));
  };

  const removeSkillWanted = (skill: string) => {
    setSkillsWanted(prev => prev.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const registrationData = {
      ...formData,
      skillsOffered,
      skillsWanted,
      avatar: avatarPreview, // In real app, this would be uploaded to server
    };

    onRegister(registrationData);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      formData.location.trim() &&
      skillsOffered.length > 0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join SkillSwap</CardTitle>
            <p className="text-muted-foreground">
              Create your account and start sharing skills
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </label>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell others about yourself and what you're passionate about..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select value={formData.availability} onValueChange={(value) => handleInputChange("availability", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available for swaps</SelectItem>
                      <SelectItem value="busy">Busy right now</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="font-semibold">Account Security</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-destructive">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="font-semibold">Your Skills</h3>
                
                {/* Skills Offered */}
                <div className="space-y-2">
                  <Label>Skills I can offer</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="e.g., Web Design, Photography, Spanish"
                      value={currentSkillOffered}
                      onChange={(e) => setCurrentSkillOffered(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())}
                    />
                    <Button type="button" onClick={addSkillOffered} variant="outline">
                      Add
                    </Button>
                  </div>
                  {skillsOffered.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skillsOffered.map((skill) => (
                        <Badge key={skill} className="bg-skill-offered text-skill-offered-foreground">
                          {skill}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => removeSkillOffered(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Wanted */}
                <div className="space-y-2">
                  <Label>Skills I want to learn</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="e.g., Guitar, Cooking, Python"
                      value={currentSkillWanted}
                      onChange={(e) => setCurrentSkillWanted(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
                    />
                    <Button type="button" onClick={addSkillWanted} variant="outline">
                      Add
                    </Button>
                  </div>
                  {skillsWanted.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skillsWanted.map((skill) => (
                        <Badge key={skill} className="bg-skill-wanted text-skill-wanted-foreground">
                          {skill}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => removeSkillWanted(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="request"
                  disabled={isLoading || !isFormValid()}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Button variant="link" className="p-0" onClick={onNavigateToLogin}>
                      Sign in here
                    </Button>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}