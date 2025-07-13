import { useState } from "react";
import { Star, MapPin, Clock, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserCardProps {
  user: {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
    location?: string;
    rating?: number;
    totalSwaps?: number;
    total_completed_swaps?: number;
    skillsOffered?: any[];
    skills_offered?: any[];
    skillsWanted?: any[];
    skills_wanted?: any[];
    availability?: 'available' | 'busy';
    bio?: string;
    badges?: any[];
    lastActive?: string;
    joined_at?: string;
  };
  currentUser: any;
  onRequestSwap: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  isAuthenticated?: boolean;
}

export function UserCard({ user, currentUser, onRequestSwap, onViewProfile, isAuthenticated = true }: UserCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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

  const getAvailabilityColor = (availability?: string) => {
    return availability === 'busy' ? 'bg-warning' : 'bg-success';
  };

  const getAvailabilityText = (availability?: string) => {
    switch(availability) {
      case 'weekdays': return 'Weekdays';
      case 'weekends': return 'Weekends';
      case 'evenings': return 'Evenings';
      case 'mornings': return 'Mornings';
      case 'flexible': return 'Flexible';
      case 'busy': return 'Busy';
      default: return 'Available';
    }
  };

  // Helper functions to get data from either format
  const getSkillsOffered = () => {
    const skills = user.skillsOffered || user.skills_offered || [];
    return skills.map((skill: any) => typeof skill === 'string' ? skill : skill.skill_name);
  };

  const getSkillsWanted = () => {
    const skills = user.skillsWanted || user.skills_wanted || [];
    return skills.map((skill: any) => typeof skill === 'string' ? skill : skill.skill_name);
  };

  const getBadges = () => {
    const badges = user.badges || [];
    return badges.map((badge: any) => typeof badge === 'string' ? badge : badge.badge?.name || badge.name);
  };

  const getTotalSwaps = () => {
    return user.totalSwaps || user.total_completed_swaps || 0;
  };

  const getLastActive = () => {
    if (user.lastActive) return user.lastActive;
    if (user.joined_at) {
      const joinDate = new Date(user.joined_at);
      return `Joined ${joinDate.toLocaleDateString()}`;
    }
    return 'Recently active';
  };

  const skillsOffered = getSkillsOffered();
  const skillsWanted = getSkillsWanted();
  const badges = getBadges();
  const totalSwaps = getTotalSwaps();
  const lastActive = getLastActive();

  return (
    <Card 
      className={`transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isHovered ? 'scale-[1.02]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewProfile(user.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div 
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getAvailabilityColor(user.availability)}`}
                title={getAvailabilityText(user.availability)}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{user.name || user.username}</h3>
              <div className="flex items-center text-sm text-muted-foreground space-x-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{user.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                {renderStars(user.rating || 0)}
                <span className="text-sm text-muted-foreground ml-1">
                  ({totalSwaps} swaps)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {user.availability || 'busy'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-2">{user.bio || 'No bio available'}</p>

        {/* Skills Offered */}
        {skillsOffered && skillsOffered.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-skill-offered-foreground">Skills Offered</h4>
            <div className="flex flex-wrap gap-1">
              {skillsOffered.slice(0, 3).map((skill, index) => (
                <Badge key={index} className="bg-skill-offered text-skill-offered-foreground text-xs">
                  {skill}
                </Badge>
              ))}
              {skillsOffered.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{skillsOffered.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Skills Wanted */}
        {skillsWanted && skillsWanted.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-skill-wanted-foreground">Looking For</h4>
            <div className="flex flex-wrap gap-1">
              {skillsWanted.slice(0, 3).map((skill, index) => (
                <Badge key={index} className="bg-skill-wanted text-skill-wanted-foreground text-xs">
                  {skill}
                </Badge>
              ))}
              {skillsWanted.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{skillsWanted.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Achievements</h4>
            <div className="flex flex-wrap gap-1">
              {badges.slice(0, 2).map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  🏆 {badge}
                </Badge>
              ))}
              {badges.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{badges.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Last Active */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{lastActive}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              if (isAuthenticated) {
                onViewProfile(user.id);
              } else {
                // For guest users, show a message instead of viewing profile
                alert('Please login to view detailed profiles');
              }
            }}
          >
            {isAuthenticated ? 'View Profile' : 'Login to View'}
          </Button>
          <Button
            variant="request"
            size="sm"
            className="flex-1"
            // Disable request button for non-authenticated users or own profile
            disabled={!isAuthenticated || !currentUser || user.id === currentUser?.id}
            onClick={(e) => {
              e.stopPropagation();
              if (isAuthenticated) {
                onRequestSwap(user.id);
              } else {
                alert('Please login to request skill swaps');
              }
            }}
            title={!isAuthenticated ? 'Login to request a skill swap' : ''}
          >
            {!currentUser ? 'Login to Request' : 'Request Swap'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}