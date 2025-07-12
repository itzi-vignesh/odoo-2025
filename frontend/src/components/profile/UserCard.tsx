import { useState } from "react";
import { Star, MapPin, Clock, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    location: string;
    rating: number;
    totalSwaps: number;
    skillsOffered: string[];
    skillsWanted: string[];
    availability: 'available' | 'busy';
    bio: string;
    badges: string[];
    lastActive: string;
  };
  currentUser: any;
  onRequestSwap: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

export function UserCard({ user, currentUser, onRequestSwap, onViewProfile }: UserCardProps) {
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

  const getAvailabilityColor = (availability: string) => {
    return availability === 'available' ? 'bg-success' : 'bg-warning';
  };

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
                title={user.availability === 'available' ? 'Available for swaps' : 'Currently busy'}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{user.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground space-x-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{user.location}</span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                {renderStars(user.rating)}
                <span className="text-sm text-muted-foreground ml-1">
                  ({user.totalSwaps} swaps)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {user.availability}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>

        {/* Skills Offered */}
        {user.skillsOffered.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-skill-offered-foreground">Skills Offered</h4>
            <div className="flex flex-wrap gap-1">
              {user.skillsOffered.slice(0, 3).map((skill) => (
                <Badge key={skill} className="bg-skill-offered text-skill-offered-foreground text-xs">
                  {skill}
                </Badge>
              ))}
              {user.skillsOffered.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{user.skillsOffered.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Skills Wanted */}
        {user.skillsWanted.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-skill-wanted-foreground">Looking For</h4>
            <div className="flex flex-wrap gap-1">
              {user.skillsWanted.slice(0, 3).map((skill) => (
                <Badge key={skill} className="bg-skill-wanted text-skill-wanted-foreground text-xs">
                  {skill}
                </Badge>
              ))}
              {user.skillsWanted.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{user.skillsWanted.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Badges */}
        {user.badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Achievements</h4>
            <div className="flex flex-wrap gap-1">
              {user.badges.slice(0, 2).map((badge) => (
                <Badge key={badge} variant="outline" className="text-xs">
                  🏆 {badge}
                </Badge>
              ))}
              {user.badges.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{user.badges.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Last Active */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{user.lastActive}</span>
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
              onViewProfile(user.id);
            }}
          >
            View Profile
          </Button>
          <Button
            variant="request"
            size="sm"
            className="flex-1"
            disabled={!currentUser || user.id === currentUser.id}
            onClick={(e) => {
              e.stopPropagation();
              onRequestSwap(user.id);
            }}
          >
            {!currentUser ? 'Login to Request' : 'Request Swap'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}