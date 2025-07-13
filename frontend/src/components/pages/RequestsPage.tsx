import { useState } from "react";
import { ArrowLeft, Clock, CheckCircle, XCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingModal } from "@/components/modals/RatingModal";

interface RequestsPageProps {
  user: any;
  onBack: () => void;
  requests: any[];
  onUpdateRequest: (requestId: string, status: string) => void;
  onSubmitRating: (requestId: string, rating: number, feedback: string) => void;
  onCancelSwap: (requestId: string) => void;
}

export function RequestsPage({ 
  user, 
  onBack, 
  requests, 
  onUpdateRequest,
  onSubmitRating,
  onCancelSwap
}: RequestsPageProps) {
  const [activeTab, setActiveTab] = useState("received");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your requests.</p>
      </div>
    );
  }

  const receivedRequests = requests.filter(r => r.toUser?.id === user.id);
  const sentRequests = requests.filter(r => r.fromUser?.id === user.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white"><Star className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAccept = (requestId: string) => {
    onUpdateRequest(requestId, 'accepted');
  };

  const handleReject = (requestId: string) => {
    onUpdateRequest(requestId, 'rejected');
  };

  const handleComplete = (requestId: string) => {
    onUpdateRequest(requestId, 'completed');
  };

  const handleRateSwap = (request: any) => {
    setSelectedRequest(request);
    setRatingModalOpen(true);
  };

  const handleSubmitRating = (rating: number, feedback: string) => {
    if (selectedRequest) {
      onSubmitRating(selectedRequest.id, rating, feedback);
    }
    setRatingModalOpen(false);
    setSelectedRequest(null);
  };

  const handleCancelSwap = (requestId: string) => {
    onCancelSwap(requestId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">My Swap Requests</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="received" className="flex items-center space-x-2">
              <span>Received</span>
              {receivedRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">{receivedRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center space-x-2">
              <span>Sent</span>
              {sentRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">{sentRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-6">
            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No requests received</h3>
                    <p className="text-muted-foreground">
                      When others want to swap skills with you, their requests will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                receivedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={request.fromUser.avatar} />
                            <AvatarFallback>{request.fromUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{request.fromUser.name}</h3>
                            <p className="text-sm text-muted-foreground">{request.fromUser.location}</p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">They want to learn:</p>
                          <Badge className="bg-skill-wanted text-skill-wanted-foreground mt-1">
                            {request.wantedSkill}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">They offer to teach:</p>
                          <Badge className="bg-skill-offered text-skill-offered-foreground mt-1">
                            {request.offeredSkill}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Message:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {request.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Received {formatDate(request.createdAt)}
                        </p>
                        
                        <div className="flex space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAccept(request.id)}
                              >
                                Accept
                              </Button>
                            </>
                          )}
                          {request.status === 'accepted' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleComplete(request.id)}
                            >
                              Mark as Completed
                            </Button>
                          )}
                          {request.status === 'completed' && !request.rated && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRateSwap(request)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Rate Swap
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No requests sent</h3>
                    <p className="text-muted-foreground">
                      Browse skills on the home page and send your first swap request!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sentRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={request.toUser.avatar} />
                            <AvatarFallback>{request.toUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{request.toUser.name}</h3>
                            <p className="text-sm text-muted-foreground">{request.toUser.location}</p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">You offered to teach:</p>
                          <Badge className="bg-skill-offered text-skill-offered-foreground mt-1">
                            {request.offeredSkill}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">You want to learn:</p>
                          <Badge className="bg-skill-wanted text-skill-wanted-foreground mt-1">
                            {request.wantedSkill}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Your message:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {request.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Sent {formatDate(request.createdAt)}
                        </p>
                        
                        {request.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSwap(request.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Cancel
                          </Button>
                        )}
                        {request.status === 'accepted' && !request.rated && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRateSwap(request)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Rate Swap
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        swapRequest={selectedRequest}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
}