import { useState, useMemo } from "react";
import { ArrowLeft, MapPin, Calendar, Users, Clock, Shield, ExternalLink, Star, MessageCircle, Award, Briefcase, CheckCircle, Phone, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwapRequestModal } from "@/components/modals/SwapRequestModal";

interface UserProfilePageProps {
  user: any; // Using any to match the existing user structure in Index.tsx
  currentUser: any;
  onBack: () => void;
  onRequestSwap: (data: any) => void;
}

export function UserProfilePage({ user, currentUser, onBack, onRequestSwap }: UserProfilePageProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // Check if user is authenticated
  const isAuthenticated = !!currentUser;
  
  // Non-authenticated users can view limited profile info
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-4">This user profile does not exist.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Mock data for demo - in real app this would come from API
  const mockFeedback = [
    {
      id: "1",
      rating: 5,
      comment: "Excellent teacher! Very patient and knowledgeable. Learned so much about UI/UX design.",
      reviewerName: "Sarah Chen",
      reviewerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612d7c7?w=150&h=150&fit=crop&crop=face",
      date: "2 weeks ago",
      helpfulCount: 12
    },
    {
      id: "2", 
      rating: 5,
      comment: "Amazing skill swap! John helped me understand React fundamentals in exchange for Spanish lessons. Highly recommend!",
      reviewerName: "Carlos Mendoza",
      reviewerAvatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
      date: "1 month ago",
      helpfulCount: 8
    },
    {
      id: "3",
      rating: 4,
      comment: "Great experience! Very professional and organized. Would definitely swap skills again.",
      reviewerName: "Emily Rodriguez", 
      reviewerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      date: "1 month ago",
      helpfulCount: 5
    }
  ];

  const mockPortfolio = [
    {
      id: "1",
      title: "E-commerce App Design",
      description: "Complete UX/UI design for a mobile shopping app",
      type: "design",
      link: "https://dribbble.com/shots/example",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop"
    },
    {
      id: "2", 
      title: "React Dashboard Project",
      description: "Full-stack dashboard built with React and Node.js",
      type: "code",
      link: "https://github.com/example/dashboard",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop"
    }
  ];

  // Calculate member since date (mock)
  const memberSince = useMemo(() => {
    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
    const randomMonth = months[Math.floor(Math.random() * 12)];
    const randomYear = 2022 + Math.floor(Math.random() * 2);
    return `${randomMonth} ${randomYear}`;
  }, [user.id]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-rating text-rating' 
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const getBadgeEmoji = (badge: string) => {
    const emojiMap: { [key: string]: string } = {
      "Top Mentor": "🏅",
      "Active Swapper": "🔥", 
      "Skill Builder": "📚",
      "100+ Swaps": "🎖️",
      "First Swap": "🌟",
      "5-Star Teacher": "⭐",
      "Design Guru": "🎨",
      "Code Master": "💻",
      "Top Rated": "👑",
      "Community Champion": "🏆",
      "Marketing Pro": "📊",
      "Language Master": "🗣️",
      "Cultural Ambassador": "🌍",
      "Creative Spirit": "🎭",
      "Data Wizard": "📈",
      "Swap Legend": "🚀",
      "Mentor": "👨‍🏫",
      "Eco Warrior": "🌱",
      "Design Pro": "✨",
      "Scandinavian Style": "🏔️",
      "Master Chef": "👨‍🍳",
      "Business Minded": "💼",
      "Wellness Guru": "🧘",
      "PM Expert": "📋",
      "Mindful Teacher": "🕯️",
      "New Member": "🆕"
    };
    return emojiMap[badge] || "🏆";
  };

  const getAvailabilityInfo = () => {
    if (user.availability === 'available') {
      return {
        text: "Available for swaps",
        color: "text-success",
        bgColor: "bg-success/10",
        icon: CheckCircle
      };
    } else {
      return {
        text: "Currently busy",
        color: "text-warning", 
        bgColor: "bg-warning/10",
        icon: Clock
      };
    }
  };

  const availabilityInfo = getAvailabilityInfo();

  const handleRequestSwap = async (data: any) => {
    await onRequestSwap(data);
    setShowRequestModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <Badge className={`${availabilityInfo.bgColor} ${availabilityInfo.color}`}>
                <availabilityInfo.icon className="h-3 w-3 mr-1" />
                {availabilityInfo.text}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
                
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.location}</span>
                </div>

                <div className="flex items-center justify-center space-x-1 mb-4">
                  {renderStars(user.rating)}
                  <span className="text-lg font-semibold ml-2">{user.rating}</span>
                </div>

                <Button
                  variant="request"
                  size="lg"
                  className="w-full"
                  disabled={!isAuthenticated || user.id === currentUser?.id}
                  onClick={() => setShowRequestModal(true)}
                  title={!isAuthenticated ? 'Login to request a skill swap' : ''}
                >
                  {!isAuthenticated 
                    ? 'Login to Request Swap' 
                    : user.id === currentUser?.id 
                      ? 'Your Profile' 
                      : 'Request Skill Swap'
                  }
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Member Since</span>
                  </div>
                  <span className="text-sm font-medium">{memberSince}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Swaps</span>
                  </div>
                  <span className="text-sm font-medium">{user.totalSwaps}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Last Active</span>
                  </div>
                  <span className="text-sm font-medium">{user.lastActive}</span>
                </div>
              </CardContent>
            </Card>

            {/* Verifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Verifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Email</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Phone</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Skills Verified</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                  </CardContent>
                </Card>

                {/* Accomplishments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5" />
                      <span>Accomplishments & Badges</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {user.badges.map((badgeObj: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-primary-light hover:bg-primary-light/80 transition-colors"
                        >
                          <div className="text-2xl">{getBadgeEmoji(badgeObj.badge?.name || badgeObj.name || 'Badge')}</div>
                          <div>
                            <div className="font-medium">{badgeObj.badge?.name || badgeObj.name || 'Badge'}</div>
                            <div className="text-xs text-muted-foreground">Earned through skill swaps</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-success/10">
                        <div className="font-medium text-success">Weekdays</div>
                        <div className="text-xs text-muted-foreground">9 AM - 6 PM</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-warning/10">
                        <div className="font-medium text-warning">Weekends</div>
                        <div className="text-xs text-muted-foreground">Limited</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-primary/10">
                        <div className="font-medium text-primary">Evenings</div>
                        <div className="text-xs text-muted-foreground">7 PM - 10 PM</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skills Offered */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-skill-offered-foreground">Skills I Offer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(user.skillsOffered || []).map((skill: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-skill-offered">
                          <span className="font-medium text-skill-offered-foreground">
                            {typeof skill === 'string' ? skill : skill.skill_name || skill.name || 'Skill'}
                          </span>
                          <Badge variant="secondary" className="text-xs">Expert</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Skills Wanted */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-skill-wanted-foreground">Skills I Want to Learn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(user.skillsWanted || []).map((skill: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-skill-wanted">
                          <span className="font-medium text-skill-wanted-foreground">
                            {typeof skill === 'string' ? skill : skill.skill_name || skill.name || 'Skill'}
                          </span>
                          <Badge variant="secondary" className="text-xs">Beginner</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Feedback Tab */}
              <TabsContent value="feedback" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Recent Feedback</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(user.rating)}
                        </div>
                        <span className="text-lg font-semibold">{user.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({mockFeedback.length} reviews)
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockFeedback.map((feedback) => (
                      <div key={feedback.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={feedback.reviewerAvatar} alt={feedback.reviewerName} />
                            <AvatarFallback>
                              {feedback.reviewerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-medium">{feedback.reviewerName}</div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    {renderStars(feedback.rating)}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{feedback.date}</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">{feedback.comment}</p>
                            
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <button className="hover:text-foreground transition-colors">
                                👍 Helpful ({feedback.helpfulCount})
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Portfolio & Projects</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mockPortfolio.map((item) => (
                        <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {item.type === 'design' ? '🎨 Design' : '💻 Code'}
                              </Badge>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Swap Request Modal */}
      <SwapRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        targetUser={user}
        currentUser={currentUser}
        onSubmit={handleRequestSwap}
      />
    </div>
  );
}