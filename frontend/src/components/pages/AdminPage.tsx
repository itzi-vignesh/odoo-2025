import { useState } from "react";
import { ArrowLeft, Users, Activity, Settings, Trash2, Eye, EyeOff, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { isAdmin } from "@/utils/userHelpers";

interface AdminPageProps {
  user: any;
  onBack: () => void;
  users: any[];
  requests: any[];
  dashboard?: any; // Add dashboard data prop
  onDeleteUser: (userId: string) => void;
  onBanUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
  onToggleUserVisibility: (userId: string) => void;
  onRejectSkill: (skillId: string, skillName: string) => void;
  onSendPlatformMessage: (data: { title: string, message: string, type: string }) => void;
  onDownloadReport: (reportType: string) => void;
}

export function AdminPage({ 
  user, 
  onBack, 
  users, 
  requests,
  dashboard,
  onDeleteUser,
  onBanUser,
  onUnbanUser,
  onToggleUserVisibility,
  onRejectSkill,
  onSendPlatformMessage,
  onDownloadReport
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState("users");

  if (!user || !isAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isPublic).length;
  const totalSwaps = requests.filter(r => r.status === 'completed').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  // Use dashboard data if available, otherwise fall back to calculated values
  const stats = dashboard?.statistics || {
    users: { total: totalUsers, active: activeUsers },
    swaps: { total: totalSwaps, pending: pendingRequests, completed: totalSwaps },
    skills: { total: 0, user_skills: 0 },
    ratings: { total: 0, average: 0 }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const recentActivity = requests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <Badge variant="destructive">Admin Only</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.users.active}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.swaps.total}</div>
              <div className="text-sm text-muted-foreground">Completed Swaps</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.swaps.pending}</div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="skills">Skills Review</TabsTrigger>
            <TabsTrigger value="messages">Platform Messages</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Swaps</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => !isAdmin(u)).map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userData.avatar || userData.profile?.avatar} />
                              <AvatarFallback>{userData.name?.charAt(0) || userData.username?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{userData.name || userData.username}</p>
                              <p className="text-sm text-muted-foreground">{userData.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{userData.location || userData.profile?.location || 'N/A'}</TableCell>
                        <TableCell>{userData.totalSwaps || userData.swap_count || 0}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{userData.rating || userData.profile?.average_rating || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant={userData.isPublic || userData.is_public ? "default" : "secondary"}>
                              {userData.isPublic || userData.is_public ? "Public" : "Private"}
                            </Badge>
                            <Badge variant={(userData.availability || userData.profile?.availability) === 'available' ? "default" : "secondary"}>
                              {userData.availability || userData.profile?.availability || 'busy'}
                            </Badge>
                            {/* Show banned status */}
                            {(userData.is_active === false || userData.isActive === false) && (
                              <Badge variant="destructive">
                                Banned
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onToggleUserVisibility(userData.id)}
                              title={(userData.isPublic || userData.is_public) ? "Make profile private" : "Make profile public"}
                            >
                              {(userData.isPublic || userData.is_public) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {/* Show Ban button for active users, Unban button for banned users */}
                            {(userData.is_active !== false && userData.isActive !== false) ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    title="Ban User"
                                    className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Ban User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to ban {userData.name || userData.username} for policy violations? They will no longer be able to access the platform.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onBanUser(userData.id)}
                                      className="bg-orange-500 text-white hover:bg-orange-600"
                                    >
                                      Ban User
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    title="Unban User"
                                    className="bg-green-500/10 hover:bg-green-500/20 text-green-600"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Unban User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to unban {userData.name || userData.username}? They will be able to access the platform again.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onUnbanUser(userData.id)}
                                      className="bg-green-500 text-white hover:bg-green-600"
                                    >
                                      Unban User
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {userData.name || userData.username}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDeleteUser(userData.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No recent activity</p>
                  ) : (
                    recentActivity.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={request.fromUser?.avatar} />
                            <AvatarFallback>{request.fromUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{request.fromUser?.name}</span>
                              {" requested swap with "}
                              <span className="font-medium">{request.toUser?.name}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {request.offeredSkill} ↔ {request.wantedSkill}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              request.status === 'completed' ? 'default' :
                              request.status === 'accepted' ? 'secondary' :
                              request.status === 'rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {request.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skills" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Review and manage skills submitted by users. Reject any skills that violate platform policies.
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Users Using</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard?.skills?.all_skills?.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell>{skill.name}</TableCell>
                        <TableCell>{skill.category || 'General'}</TableCell>
                        <TableCell>{skill.user_count || 0}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Reject Skill
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Skill</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reject the skill "{skill.name}"? This will remove it from all users who have it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onRejectSkill(skill.id, skill.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Reject Skill
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No skills available for review
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <form 
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const title = formData.get('title') as string;
                    const message = formData.get('message') as string;
                    const type = formData.get('type') as string;
                    
                    if (title && message && type) {
                      onSendPlatformMessage({ title, message, type });
                      // Reset form
                      e.currentTarget.reset();
                    }
                  }}
                >
                  <p className="text-sm text-muted-foreground">
                    Send platform-wide messages to all users. Use this for important announcements, updates, or maintenance notices.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="title" className="text-sm font-medium">Message Title</label>
                      <input 
                        id="title" 
                        name="title"
                        className="w-full p-2 border rounded-md" 
                        placeholder="E.g., New Feature Announcement"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="type" className="text-sm font-medium">Message Type</label>
                      <select id="type" name="type" className="w-full p-2 border rounded-md" required>
                        <option value="system">System Message</option>
                        <option value="admin_message">Admin Message</option>
                        <option value="maintenance">Maintenance Notice</option>
                        <option value="feature_update">Feature Update</option>
                      </select>
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="message" className="text-sm font-medium">Message Content</label>
                      <textarea 
                        id="message" 
                        name="message"
                        className="w-full p-2 border rounded-md min-h-[100px]" 
                        placeholder="Enter your message here..."
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">Send Platform Message</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Download reports for platform analytics and user activity.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">User Activity Report</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Contains user registration data, login frequency, and platform engagement metrics.
                        </p>
                        <Button 
                          onClick={() => onDownloadReport('user_activity')}
                          className="w-full"
                        >
                          Download User Report
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">Swap Statistics Report</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Contains data on swap requests, completion rates, and most exchanged skills.
                        </p>
                        <Button 
                          onClick={() => onDownloadReport('swap_statistics')}
                          className="w-full"
                        >
                          Download Swap Report
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">Feedback & Ratings Report</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Contains user rating data, feedback content, and satisfaction metrics.
                        </p>
                        <Button 
                          onClick={() => onDownloadReport('feedback')}
                          className="w-full"
                        >
                          Download Feedback Report
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">Platform Usage Report</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Contains platform traffic, feature usage, and performance metrics.
                        </p>
                        <Button 
                          onClick={() => onDownloadReport('platform_usage')}
                          className="w-full"
                        >
                          Download Usage Report
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
