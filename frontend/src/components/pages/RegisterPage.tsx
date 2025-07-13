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
import { validateFormData } from "@/lib/errorHandler";

interface RegisterPageProps {
  onRegister: (data: any) => void;
  onNavigateToLogin: () => void;
  isLoading?: boolean;
  error?: string;
}

export function RegisterPage({ onRegister, onNavigateToLogin, isLoading, error }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    location: "",
    bio: "",
    availability: "flexible",
    is_public: true,
    avatar: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [currentSkillOffered, setCurrentSkillOffered] = useState("");
  const [currentSkillWanted, setCurrentSkillWanted] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    if (field === "is_public") {
      setFormData(prev => ({ ...prev, [field]: value === "true" }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear validation errors when user starts typing
    setValidationErrors([]);
  };

  // Patch avatar validation to only allow .png, .jpg, .jpeg, .svg
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setAvatarError('Please select a valid image file (PNG, JPG, JPEG, or SVG)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, avatar: null }));
      setAvatarPreview(null);
      setAvatarError('');
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

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // Required fields
    if (!formData.username.trim()) {
      errors.push("Username is required");
    }
    
    if (!formData.first_name.trim()) {
      errors.push("First name is required");
    }
    
    if (!formData.last_name.trim()) {
      errors.push("Last name is required");
    }
    
    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    
    if (!formData.password) {
      errors.push("Password is required");
    } else if (formData.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!formData.password2) {
      errors.push("Please confirm your password");
    } else if (formData.password !== formData.password2) {
      errors.push("Passwords do not match");
    }
    
    if (!formData.location.trim()) {
      errors.push("Location is required");
    }
    
    if (skillsOffered.length === 0) {
      errors.push("Please add at least one skill you can offer");
    }
    
    if (avatarError) {
      errors.push(avatarError);
    }
    
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors([]);
    
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Only include avatar if provided (optional field)
    const registrationData: any = {
      ...formData,
      skills_offered: skillsOffered,
      skills_wanted: skillsWanted,
    };
    if (!formData.avatar) {
      delete registrationData.avatar;
    }

    onRegister(registrationData);
  };

  const isFormValid = () => {
    return (
      formData.username.trim() &&
      formData.first_name.trim() &&
      formData.last_name.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.password2 &&
      formData.password === formData.password2 &&
      formData.location.trim() &&
      skillsOffered.length > 0 &&
      !avatarError
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
            {/* Error Display */}
            {(error || validationErrors.length > 0) && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <ul className="text-sm text-destructive space-y-1">
                  {error && <li>• {error}</li>}
                  {validationErrors.map((validationError, index) => (
                    <li key={index}>• {validationError}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label>Profile Photo (Optional)</Label>
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
                        accept="image/png,image/jpg,image/jpeg,image/svg+xml"
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
                  {avatarError && <div className="text-xs text-red-500 mt-1">{avatarError}</div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      placeholder="First name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      placeholder="Last name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <Select value={formData.availability} onValueChange={(value) => handleInputChange("availability", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="evenings">Evenings</SelectItem>
                        <SelectItem value="mornings">Mornings</SelectItem>
                        <SelectItem value="flexible">Flexible Schedule</SelectItem>
                        <SelectItem value="busy">Currently Busy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select value={formData.is_public ? "public" : "private"} onValueChange={(value) => handleInputChange("is_public", value === "public" ? "true" : "false")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public Profile</SelectItem>
                        <SelectItem value="private">Private Profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="font-semibold">Account Security</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
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
                    <Label htmlFor="password">Password *</Label>
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
                    <Label htmlFor="password2">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password2"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.password2}
                        onChange={(e) => handleInputChange("password2", e.target.value)}
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
                    {formData.password2 && formData.password !== formData.password2 && (
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
                  <Label>Skills I can offer *</Label>
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
                  disabled={isLoading}
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