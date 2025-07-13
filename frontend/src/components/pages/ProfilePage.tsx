import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfilePageProps {
  user: any;
  onBack: () => void;
  onSave: (data: any) => void;
}

export function ProfilePage({ user, onBack, onSave }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    location: user?.location || "",
    bio: user?.bio || "",
    isPublic: user?.isPublic ?? true,
    availability: user?.availability || "flexible",
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    avatar: user?.avatar || "",
  });
  const [newSkillOffered, setNewSkillOffered] = useState("");
  const [newSkillWanted, setNewSkillWanted] = useState("");

  // Debug: Log the user prop received
  console.log("ProfilePage received user prop:", user);

  // Update formData when user prop changes
  useEffect(() => {
    console.log("ProfilePage updating formData with user:", user);
    
    // Extract skills from the backend response format
    const skillsOffered = user?.skills_offered?.map((skill: any) => skill.skill_name) || user?.skillsOffered || [];
    const skillsWanted = user?.skills_wanted?.map((skill: any) => skill.skill_name) || user?.skillsWanted || [];
    
    // Build the full name from first_name and last_name
    const fullName = user?.first_name && user?.last_name 
      ? `${user.first_name} ${user.last_name}`.trim()
      : user?.name || user?.username || "";

    setFormData({
      name: fullName,
      location: user?.location || "",
      bio: user?.bio || "",
      isPublic: user?.isPublic !== undefined ? user.isPublic : user?.is_public ?? true,
      availability: user?.availability || "flexible",
      skillsOffered: skillsOffered,
      skillsWanted: skillsWanted,
      avatar: user?.avatar || "",
    });
  }, [user]);

  useEffect(() => {
    // Auto-save to localStorage as draft
    const draft = JSON.stringify(formData);
    localStorage.setItem("skillswap_profile_draft", draft);
  }, [formData]);

  // Patch formData to map to backend field names on save
  const handleSave = () => {
    const payload = {
      ...formData,
      skills_offered: formData.skillsOffered,
      skills_wanted: formData.skillsWanted,
      is_public: formData.isPublic,
    };
    onSave(payload);
    setIsEditing(false);
    localStorage.removeItem("skillswap_profile_draft");
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      location: user?.location || "",
      bio: user?.bio || "",
      isPublic: user?.isPublic ?? true,
      availability: user?.availability || "flexible",
      skillsOffered: user?.skillsOffered || [],
      skillsWanted: user?.skillsWanted || [],
      avatar: user?.avatar || "",
    });
    setIsEditing(false);
  };

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !formData.skillsOffered.includes(newSkillOffered.trim())) {
      setFormData({
        ...formData,
        skillsOffered: [...formData.skillsOffered, newSkillOffered.trim()]
      });
      setNewSkillOffered("");
    }
  };

  const removeSkillOffered = (skill: string) => {
    setFormData({
      ...formData,
      skillsOffered: formData.skillsOffered.filter(s => s !== skill)
    });
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !formData.skillsWanted.includes(newSkillWanted.trim())) {
      setFormData({
        ...formData,
        skillsWanted: [...formData.skillsWanted, newSkillWanted.trim()]
      });
      setNewSkillWanted("");
    }
  };

  const removeSkillWanted = (skill: string) => {
    setFormData({
      ...formData,
      skillsWanted: formData.skillsWanted.filter(s => s !== skill)
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">My Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={isEditing ? formData.avatar : user.avatar} alt={user.name} />
                      <AvatarFallback className="text-lg">
                        {(user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name || user.username || 'U').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="flex-1">
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input
                          id="avatar"
                          value={formData.avatar}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                          placeholder="Enter image URL..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      ) : (
                        <p className="text-lg font-medium">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name || user.username}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      ) : (
                        <p className="text-muted-foreground">{user.location}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell others about yourself..."
                      />
                    ) : (
                      <p className="text-muted-foreground">{user.bio}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{user.rating || 0}</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{user.total_completed_swaps || user.totalSwaps || 0}</div>
                    <div className="text-sm text-muted-foreground">Completed Swaps</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Badges</Label>
                    <div className="flex flex-wrap gap-2">
                      {(user.badges || []).map((badgeObj: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {badgeObj.badge?.name || badgeObj.name || 'Badge'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills Offered */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Skills I Offer
                    <Badge className="bg-skill-offered text-skill-offered-foreground">
                      {(isEditing ? formData.skillsOffered : (user.skills_offered?.map((skill: any) => skill.skill_name) || user.skillsOffered || [])).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a skill you can teach..."
                        value={newSkillOffered}
                        onChange={(e) => setNewSkillOffered(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkillOffered()}
                      />
                      <Button onClick={addSkillOffered} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? formData.skillsOffered : (user.skills_offered?.map((skill: any) => skill.skill_name) || user.skillsOffered || [])).map((skill: string) => (
                      <Badge
                        key={skill}
                        className="bg-skill-offered text-skill-offered-foreground flex items-center space-x-1"
                      >
                        <span>{skill}</span>
                        {isEditing && (
                          <button onClick={() => removeSkillOffered(skill)}>
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Wanted */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Skills I Want to Learn
                    <Badge className="bg-skill-wanted text-skill-wanted-foreground">
                      {(isEditing ? formData.skillsWanted : (user.skills_wanted?.map((skill: any) => skill.skill_name) || user.skillsWanted || [])).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a skill you want to learn..."
                        value={newSkillWanted}
                        onChange={(e) => setNewSkillWanted(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkillWanted()}
                      />
                      <Button onClick={addSkillWanted} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? formData.skillsWanted : (user.skills_wanted?.map((skill: any) => skill.skill_name) || user.skillsWanted || [])).map((skill: string) => (
                      <Badge
                        key={skill}
                        className="bg-skill-wanted text-skill-wanted-foreground flex items-center space-x-1"
                      >
                        <span>{skill}</span>
                        {isEditing && (
                          <button onClick={() => removeSkillWanted(skill)}>
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <Switch
                    checked={isEditing ? formData.isPublic : user.isPublic}
                    onCheckedChange={(checked) => 
                      isEditing && setFormData({ ...formData, isPublic: checked })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Availability Status</Label>
                  {isEditing ? (
                    <Select
                      value={formData.availability}
                      onValueChange={(value) => setFormData({ ...formData, availability: value })}
                    >
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
                  ) : (
                    <Badge variant={user.availability === 'busy' ? 'secondary' : 'default'}>
                      {user.availability === 'weekdays' ? 'Weekdays' :
                       user.availability === 'weekends' ? 'Weekends' :
                       user.availability === 'evenings' ? 'Evenings' :
                       user.availability === 'mornings' ? 'Mornings' :
                       user.availability === 'flexible' ? 'Flexible Schedule' :
                       user.availability === 'busy' ? 'Currently Busy' : 'Available'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}