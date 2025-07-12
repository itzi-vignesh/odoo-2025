import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: any;
  currentUser: any;
  onSubmit: (data: any) => void;
}

export function SwapRequestModal({
  isOpen,
  onClose,
  targetUser,
  currentUser,
  onSubmit,
}: SwapRequestModalProps) {
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState("");
  const [selectedWantedSkill, setSelectedWantedSkill] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetUser || !currentUser) return null;

  const handleSubmit = async () => {
    if (!selectedOfferedSkill || !selectedWantedSkill || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    const requestData = {
      targetUserId: targetUser.id,
      offeredSkill: selectedOfferedSkill,
      wantedSkill: selectedWantedSkill,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    await onSubmit(requestData);
    setIsSubmitting(false);
    
    // Reset form
    setSelectedOfferedSkill("");
    setSelectedWantedSkill("");
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Request Skill Swap</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Target User Info */}
          <div className="flex items-center space-x-3 p-4 bg-card-hover rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={targetUser.avatar} alt={targetUser.name} />
              <AvatarFallback>{targetUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{targetUser.name}</h3>
              <p className="text-sm text-muted-foreground">{targetUser.location}</p>
            </div>
          </div>

          {/* Your Skills to Offer */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select a skill you want to offer:</label>
            <Select value={selectedOfferedSkill} onValueChange={setSelectedOfferedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Choose one of your skills..." />
              </SelectTrigger>
              <SelectContent>
                {currentUser.skillsOffered.map((skill: string) => (
                  <SelectItem key={skill} value={skill}>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-skill-offered text-skill-offered-foreground">
                        {skill}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentUser.skillsOffered.length === 0 && (
              <p className="text-sm text-muted-foreground">
                You need to add skills to your profile first.
              </p>
            )}
          </div>

          {/* Their Skills You Want */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select a skill you want to learn:</label>
            <Select value={selectedWantedSkill} onValueChange={setSelectedWantedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Choose from their skills..." />
              </SelectTrigger>
              <SelectContent>
                {targetUser.skillsOffered.filter((skill: string) => 
                  currentUser.skillsWanted.includes(skill)
                ).map((skill: string) => (
                  <SelectItem key={skill} value={skill}>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-skill-wanted text-skill-wanted-foreground">
                        {skill}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
                {targetUser.skillsOffered.filter((skill: string) => 
                  !currentUser.skillsWanted.includes(skill)
                ).map((skill: string) => (
                  <SelectItem key={skill} value={skill}>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-muted text-muted-foreground">
                        {skill}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Skills highlighted in color match your wanted skills list
            </p>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Personal message:</label>
            <Textarea
              placeholder="Introduce yourself and explain why you'd like to swap skills..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          {/* Preview */}
          {selectedOfferedSkill && selectedWantedSkill && (
            <div className="p-4 bg-primary-light rounded-lg border">
              <h4 className="font-medium mb-2">Swap Summary:</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">You offer:</span>{" "}
                  <Badge className="bg-skill-offered text-skill-offered-foreground ml-1">
                    {selectedOfferedSkill}
                  </Badge>
                </p>
                <p>
                  <span className="font-medium">You want to learn:</span>{" "}
                  <Badge className="bg-skill-wanted text-skill-wanted-foreground ml-1">
                    {selectedWantedSkill}
                  </Badge>
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="request"
              onClick={handleSubmit}
              className="flex-1"
              disabled={
                !selectedOfferedSkill || 
                !selectedWantedSkill || 
                !message.trim() || 
                isSubmitting ||
                message.length > 500
              }
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}