import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapRequest: any;
  onSubmit: (rating: number, feedback: string) => void;
}

export function RatingModal({ isOpen, onClose, swapRequest, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !swapRequest) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    await onSubmit(rating, feedback);
    setIsSubmitting(false);
    
    // Reset form
    setRating(0);
    setHoverRating(0);
    setFeedback("");
    onClose();
  };

  const renderStar = (index: number) => {
    const filled = index < (hoverRating || rating);
    return (
      <Star
        key={index}
        className={`h-8 w-8 cursor-pointer transition-colors ${
          filled ? 'fill-rating text-rating' : 'text-muted-foreground hover:text-rating'
        }`}
        onClick={() => setRating(index + 1)}
        onMouseEnter={() => setHoverRating(index + 1)}
        onMouseLeave={() => setHoverRating(0)}
      />
    );
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Select a rating";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rate Your Skill Swap Experience</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Swap Details */}
          <div className="p-4 bg-card-hover rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={swapRequest.user.avatar} alt={swapRequest.user.name} />
                <AvatarFallback>{swapRequest.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{swapRequest.user.name}</h3>
                <p className="text-sm text-muted-foreground">Skill swap partner</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">You learned:</span>
                <Badge className="bg-skill-offered text-skill-offered-foreground">
                  {swapRequest.offeredSkill}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">You taught:</span>
                <Badge className="bg-skill-wanted text-skill-wanted-foreground">
                  {swapRequest.wantedSkill}
                </Badge>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="text-center space-y-4">
            <div>
              <h3 className="font-medium mb-2">How was your experience?</h3>
              <div className="flex justify-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => renderStar(i))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {getRatingText(hoverRating || rating)}
              </p>
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Share your feedback (optional):
            </label>
            <Textarea
              placeholder="What did you learn? How was the teaching? Any suggestions?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {feedback.length}/300 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Skip for Now
            </Button>
            <Button
              variant="request"
              onClick={handleSubmit}
              className="flex-1"
              disabled={rating === 0 || isSubmitting || feedback.length > 300}
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}