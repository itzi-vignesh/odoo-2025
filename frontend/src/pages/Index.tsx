import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/components/pages/HomePage";
import { LoginPage } from "@/components/pages/LoginPage";
import { RegisterPage } from "@/components/pages/RegisterPage";
import { ProfilePage } from "@/components/pages/ProfilePage";
import { RequestsPage } from "@/components/pages/RequestsPage";
import { AdminPage } from "@/components/pages/AdminPage";
import { UserProfilePage } from "@/components/pages/UserProfilePage";
import { useToast } from "@/hooks/use-toast";
import { 
  userAPI, 
  authAPI, 
  skillAPI, 
  swapAPI, 
  ratingAPI, 
  notificationAPI,
  adminAPI
} from "@/lib/api";
import { 
  handleAsyncOperation, 
  parseApiError, 
  logError, 
  getUserFriendlyMessage,
  retryOperation 
} from "@/lib/errorHandler";

// Utility to normalize user fields from backend
function normalizeUser(user) {
  // Handle name properly
  let name = user.name;
  if (!name) {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    if (firstName || lastName) {
      name = `${firstName} ${lastName}`.trim();
    } else {
      name = user.username || 'User';
    }
  }

  return {
    ...user,
    name: name,
    skillsOffered: user.skillsOffered || user.skills_offered || [],
    skillsWanted: user.skillsWanted || user.skills_wanted || [],
    isPublic: user.isPublic !== undefined ? user.isPublic : user.is_public,
    totalSwaps: user.totalSwaps !== undefined ? user.totalSwaps : user.total_completed_swaps,
    rating: user.rating || 0,
    badges: user.badges || [],
    avatar: user.avatar,
    location: user.location || '',
    availability: user.availability || 'flexible',
    role: user.role || 'user',
    id: user.id,
    email: user.email,
    bio: user.bio || '',
  };
}
// Utility to normalize swap fields
function normalizeSwap(swap) {
  return {
    ...swap,
    fromUser: swap.fromUser || swap.from_user,
    toUser: swap.toUser || swap.to_user,
    offeredSkill: swap.skill_offered?.name || swap.offeredSkill || '',
    wantedSkill: swap.skill_wanted?.name || swap.wantedSkill || '',
    status: swap.status,
    id: swap.id,
    message: swap.message,
    createdAt: swap.created_at || swap.createdAt,
    rated: swap.rated || false,
  };
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [currentPage, setCurrentPage] = useState("home");
  const [viewingUserId, setViewingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const profileDataLoadedRef = useRef(false);
  const { toast } = useToast();

  // Load user data and preferences from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("skillswap_darkMode");
    const token = localStorage.getItem("accessToken");

    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    
    // If there's a token, try to load the current user
    if (token) {
      loadCurrentUser();
    } else {
      // Load public users for non-authenticated users
      loadUsers();
    }
  }, []);

  // Load profile data for current user
  const loadProfileData = useCallback(async () => {
    if (!currentUser?.id) return;
    
    console.log('Loading profile data for user:', currentUser.id);
    setIsProfileLoading(true);
    const { data, error } = await handleAsyncOperation(
      async () => {
        const response = await userAPI.getCurrentUser();
        console.log('Backend response for profile data:', response.data);
        return response.data;
      },
      (error) => {
        logError(error, 'loadProfileData');
        toast({
          title: "Failed to load profile",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      setIsProfileLoading(false);
      return;
    }

    console.log('Profile data loaded:', data);
    console.log('Skills offered from backend:', data.skills_offered);
    console.log('Skills wanted from backend:', data.skills_wanted);
    setCurrentUser(data);
    setIsProfileLoading(false);
  }, [currentUser?.id]);

  // Load current user from API
  const loadCurrentUser = async () => {
    console.log('Loading current user...');
    const { data, error } = await handleAsyncOperation(
      async () => {
        const response = await userAPI.getCurrentUser();
        return response.data;
      },
      (error) => {
        logError(error, 'loadCurrentUser');
        // Token might be expired, clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    );

    if (error) {
      console.error("Failed to load user data", error);
      return;
    }

    console.log('Current user loaded:', data);
    setCurrentUser(data);
    // Reset profile data loaded ref when user changes
    profileDataLoadedRef.current = false;
    
    // If user is admin, redirect to admin page and load admin data
    if (data.role === 'admin') {
      setCurrentPage("admin");
      loadAdminData();
    } else {
      // Load notifications and swap requests only for regular users
      loadNotifications();
      loadSwapRequests();
      loadUsers();
    }
  };

  // Load all users
  const loadUsers = async () => {
    const { data, error } = await handleAsyncOperation(
      async () => {
        // Use public API for guest users, authenticated API for logged-in users
        let response;
        if (localStorage.getItem("accessToken")) {
          response = await userAPI.getUsers();
        } else {
          response = await userAPI.getPublicUsers();
        }
        return response.data.results.map(normalizeUser);
      },
      (error) => {
        logError(error, 'loadUsers');
        toast({
          title: "Failed to load users",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      // Set empty array if we can't load users
      setUsers([]);
      return;
    }

    setUsers(data);
  };

  // Load notifications
  const loadNotifications = async () => {
    const { data, error } = await handleAsyncOperation(
      async () => {
        const response = await notificationAPI.getNotifications();
        return response.data.results || response.data;
      },
      (error) => {
        logError(error, 'loadNotifications');
        toast({
          title: "Failed to load notifications",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      setNotifications([]);
      return;
    }

    setNotifications(data);
  };

  // Load swap requests
  const loadSwapRequests = async () => {
    const { data, error } = await handleAsyncOperation(
      async () => {
        const sentResponse = await swapAPI.getSentRequests();
        const receivedResponse = await swapAPI.getReceivedRequests();
        
        const allRequests = [
          ...(sentResponse.data.results || sentResponse.data),
          ...(receivedResponse.data.results || receivedResponse.data)
        ];
        
        return allRequests.map(normalizeSwap);
      },
      (error) => {
        logError(error, 'loadSwapRequests');
        toast({
          title: "Failed to load swap requests",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      setSwapRequests([]);
      return;
    }

    setSwapRequests(data);
  };

  // Clear admin cache and refresh data
  const clearAdminCache = useCallback(() => {
    localStorage.removeItem('skillswap_admin_data');
    console.log('Admin cache cleared');
  }, []);

  // Load cached admin data if available
  const loadCachedAdminData = () => {
    const cachedData = localStorage.getItem('skillswap_admin_data');
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        const cacheAge = Date.now() - data.timestamp;
        // Use cached data if it's less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          setUsers(data.users || []);
          setSwapRequests(data.swaps || []);
          setNotifications(data.notifications || []);
          setDashboardData(data.dashboard || {});
          return true;
        }
      } catch (error) {
        console.error('Failed to parse cached admin data:', error);
      }
    }
    return false;
  };

  // Load admin data - separate from regular user data
  const loadAdminData = useCallback(async () => {
    // Try to load cached data first
    if (loadCachedAdminData()) {
      // Refresh data in background
      setTimeout(() => loadAdminData(), 1000);
      return;
    }

    const { data, error } = await handleAsyncOperation(
      async () => {
        // Get comprehensive admin dashboard data
        const dashboardResponse = await adminAPI.getDashboardData();
        const dashboardData = dashboardResponse.data;
        
        // Get detailed user data for admin management (including banned users)
        const usersResponse = await adminAPI.getDetailedUsers();
        const users = usersResponse.data.map(normalizeUser);
        
        // Get all swap requests for admin monitoring
        const swapsResponse = await swapAPI.getSwapRequests();
        const swaps = swapsResponse.data.results.map(normalizeSwap);
        
        // Get admin notifications
        const notificationsResponse = await notificationAPI.getNotifications();
        const notifications = notificationsResponse.data.results || notificationsResponse.data;
        
        return { 
          dashboard: dashboardData,
          users, 
          swaps, 
          notifications 
        };
      },
      (error) => {
        logError(error, 'loadAdminData');
        toast({
          title: "Failed to load admin data",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      setUsers([]);
      setSwapRequests([]);
      setNotifications([]);
      return;
    }

    setUsers(data.users);
    setSwapRequests(data.swaps);
    setNotifications(data.notifications);
    setDashboardData(data.dashboard); // Store dashboard data
    
    // Cache admin data in localStorage for persistence
    localStorage.setItem('skillswap_admin_data', JSON.stringify({
      users: data.users,
      swaps: data.swaps,
      notifications: data.notifications,
      dashboard: data.dashboard,
      timestamp: Date.now()
    }));
  }, []);

  // Effect to load profile data when profile page is accessed
  useEffect(() => {
    if (currentPage === "profile" && currentUser?.id && !isProfileLoading && !profileDataLoadedRef.current) {
      // Only load profile data if we don't have complete data
      const hasCompleteData = currentUser.name && currentUser.skillsOffered && currentUser.skillsWanted;
      if (!hasCompleteData) {
        profileDataLoadedRef.current = true;
        loadProfileData();
      }
    }
  }, [currentPage, currentUser?.id, isProfileLoading, loadProfileData]);

  // Effect to load admin data when admin page is accessed
  useEffect(() => {
    if (currentPage === "admin" && currentUser?.role === 'admin') {
      // Only load admin data if we don't have it or if it's stale
      const hasAdminData = users.length > 0 && swapRequests.length > 0;
      if (!hasAdminData) {
        clearAdminCache();
        loadAdminData();
      }
    }
  }, [currentPage, currentUser?.role, users.length, swapRequests.length, loadAdminData]);

  // Effect to load users when user logs in (if not an admin)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      loadUsers();
    }
  }, [currentUser]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("skillswap_darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Navigation handler
  const handleNavigate = (page: string) => {
    // If user is admin, restrict them to admin-only pages
    if (currentUser?.role === 'admin') {
      if (page === 'admin' || page === 'login') {
        setCurrentPage(page);
      } else {
        toast({
          title: "Access restricted",
          description: "Admin users can only access the admin panel.",
        });
        return;
      }
    } else {
      // Regular navigation for normal users
      setCurrentPage(page);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authentication handlers
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await handleAsyncOperation(
      async () => {
        const response = await authAPI.login(email, password);
        return response;
      },
      (error) => {
        logError(error, 'handleLogin');
        setError(getUserFriendlyMessage(error));
        toast({ 
          title: 'Login failed', 
          description: getUserFriendlyMessage(error), 
          variant: 'destructive' 
        });
      }
    );

    if (error) {
      setIsLoading(false);
      return;
    }

    // Store tokens
    if (data.data && (data.data.access || data.data.access_token)) {
      localStorage.setItem("accessToken", data.data.access || data.data.access_token);
      localStorage.setItem("refreshToken", data.data.refresh);
      setCurrentUser(data.data.user);
      
      // Redirect admin users to admin page, regular users to home page
      if (data.data.user && data.data.user.role === 'admin') {
        setCurrentPage("admin");
        toast({
          title: "Welcome, Admin!",
          description: "Accessing admin panel for platform management.",
        });
      } else {
        setCurrentPage("home");
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to SkillSwap.",
        });
      }
    } else {
      setError("Invalid response from server");
      toast({ 
        title: 'Login failed', 
        description: "Invalid response from server", 
        variant: 'destructive' 
      });
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    const { data: responseData, error } = await handleAsyncOperation(
      async () => {
        // Build payload with all required fields
        const payload = {
          username: data.username || data.email,
          email: data.email,
          password: data.password,
          password2: data.password2 || data.password,
          first_name: data.first_name || data.firstName || '',
          last_name: data.last_name || data.lastName || '',
          bio: data.bio || '',
          location: data.location || '',
          avatar: data.avatar || '',
          availability: data.availability || 'flexible',
          is_public: data.is_public !== undefined ? data.is_public : true,
          skills_offered: data.skills_offered || data.skillsOffered || [],
          skills_wanted: data.skills_wanted || data.skillsWanted || [],
        };
        
        console.log('Registration payload:', payload);
        const response = await authAPI.register(payload);
        console.log('Registration response:', response);
        return response;
      },
      (error) => {
        logError(error, 'handleRegister');
        setError(getUserFriendlyMessage(error));
        toast({ 
          title: 'Registration failed', 
          description: getUserFriendlyMessage(error), 
          variant: 'destructive' 
        });
      }
    );

    if (error) {
      setIsLoading(false);
      return;
    }

    localStorage.setItem("accessToken", responseData.data.access);
    localStorage.setItem("refreshToken", responseData.data.refresh);
    setCurrentUser(responseData.data.user);
    
    // Redirect admin users to admin page, regular users to home page
    if (responseData.data.user && responseData.data.user.role === 'admin') {
      setCurrentPage("admin");
      toast({
        title: "Admin account created!",
        description: "Welcome to the admin panel for platform management.",
      });
    } else {
      setCurrentPage("home");
      toast({
        title: "Account created!",
        description: "Welcome to SkillSwap! Start exploring skills to learn.",
      });
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("skillswap_admin_data"); // Clear admin data cache
    setCurrentUser(null);
    setUsers([]);
    setSwapRequests([]);
    setNotifications([]);
    setDashboardData({});
    setCurrentPage("login");
  };

  // Skill swap request handler
  const handleRequestSwap = async (data: any) => {
    // Check if user has permission to make swap requests
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please log in to request skill swaps",
        variant: "destructive",
      });
      return;
    }
    
    // Admin users shouldn't create swap requests
    if (currentUser.role === 'admin') {
      toast({
        title: "Feature unavailable",
        description: "Admin users cannot create swap requests",
        variant: "destructive",
      });
      return;
    }
    
    // Guest users shouldn't create swap requests
    if (currentUser.role === 'guest') {
      toast({
        title: "Feature unavailable",
        description: "Guest users cannot request swaps. Please register for a full account.",
        variant: "destructive",
      });
      return;
    }
    
    const { error } = await handleAsyncOperation(
      async () => {
        const requestData = {
          to_user_id: parseInt(data.targetUserId),
          skill_offered_name: data.offeredSkill,
          skill_wanted_name: data.wantedSkill,
          message: data.message,
        };
        
        await swapAPI.createSwapRequest(requestData);
      },
      (error) => {
        logError(error, 'handleRequestSwap');
        toast({
          title: "Request failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Refresh swap requests
    loadSwapRequests();
    
    toast({
      title: "Request sent!",
      description: `Your swap request has been sent successfully`,
    });
  };

  const handleViewProfile = (userId: string) => {
    // Track the userId being viewed
    setViewingUserId(userId);
    
    // Guest users can view public profiles, but with limited details
    // Regular users can view detailed profiles
    setCurrentPage("user-profile");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProfile = async (data: any) => {
    const { error } = await handleAsyncOperation(
      async () => {
        await userAPI.updateProfile(data);
      },
      (error) => {
        logError(error, 'handleUpdateProfile');
        toast({
          title: "Update failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Refresh user data
    loadCurrentUser();
    
    toast({
      title: "Profile updated!",
      description: "Your changes have been saved.",
    });
  };

  const handleUpdateRequest = async (requestId: string, status: string) => {
    // Admin users shouldn't update swap requests in the normal flow
    if (currentUser?.role === 'admin') {
      toast({
        title: "Feature unavailable",
        description: "Admin users cannot update swap requests in this view",
        variant: "destructive",
      });
      return;
    }
    
    const { error } = await handleAsyncOperation(
      async () => {
        await swapAPI.updateSwapRequest(parseInt(requestId), { status });
      },
      (error) => {
        logError(error, 'handleUpdateRequest');
        toast({
          title: "Update failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Refresh swap requests
    loadSwapRequests();
    
    const actionText = status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'completed';
    toast({
      title: `Request ${actionText}!`,
      description: `Swap request has been ${actionText}.`,
    });
  };

  const handleSubmitRating = async (requestId: string, score: number, feedback: string) => {
    // Admin users shouldn't submit ratings
    if (currentUser?.role === 'admin') {
      toast({
        title: "Feature unavailable",
        description: "Admin users cannot submit ratings",
        variant: "destructive",
      });
      return;
    }
    
    const { error } = await handleAsyncOperation(
      async () => {
        await ratingAPI.createRating({
          swap_request_id: parseInt(requestId),
          score,
          feedback
        });
      },
      (error) => {
        logError(error, 'handleSubmitRating');
        toast({
          title: "Rating failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Refresh swap requests
    loadSwapRequests();
    
    toast({
      title: "Rating submitted!",
      description: "Thank you for your feedback.",
    });
  };

  // Admin handler: Delete user 
  const handleDeleteUser = async (userId: string) => {
    const { error } = await handleAsyncOperation(
      async () => {
        await adminAPI.updateUser(parseInt(userId), { is_active: false });
      },
      (error) => {
        logError(error, 'handleDeleteUser');
        toast({
          title: "Delete failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Update the users list by removing the deleted user
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    toast({
      title: "User deactivated",
      description: "User has been successfully deactivated from the platform.",
    });
  };
  
  // Admin handler: Ban user
  const handleBanUser = async (userId: string) => {
    const { error } = await handleAsyncOperation(
      async () => {
        await adminAPI.banUser(parseInt(userId));
      },
      (error) => {
        logError(error, 'handleBanUser');
        toast({
          title: "Ban failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Refresh admin data to get updated user list
    loadAdminData();
    
    toast({
      title: "User banned",
      description: "User has been successfully banned from the platform for policy violations.",
    });
  };

  // Admin handler: Unban user
  const handleUnbanUser = async (userId: string) => {
    const { error } = await handleAsyncOperation(
      async () => {
        await adminAPI.unbanUser(parseInt(userId));
      },
      (error) => {
        logError(error, 'handleUnbanUser');
        toast({
          title: "Unban failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Refresh admin data to get updated user list
    loadAdminData();
    
    toast({
      title: "User unbanned",
      description: "User has been successfully unbanned and can now access the platform.",
    });
  };

  // Admin handler: Toggle user visibility
  const handleToggleUserVisibility = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const { error } = await handleAsyncOperation(
      async () => {
        await adminAPI.updateUser(parseInt(userId), { is_public: !user.isPublic });
      },
      (error) => {
        logError(error, 'handleToggleUserVisibility');
        toast({
          title: "Update failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Update the users list
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isPublic: !user.isPublic } : user
    ));
    
    toast({
      title: "User updated",
      description: `User profile is now ${!user.isPublic ? 'public' : 'private'}.`,
    });
  };
  
  // Admin handler: Reject inappropriate skill
  const handleRejectSkill = async (skillId: string, skillName: string) => {
    const { error } = await handleAsyncOperation(
      async () => {
        await adminAPI.rejectSkill(parseInt(skillId));
      },
      (error) => {
        logError(error, 'handleRejectSkill');
        toast({
          title: "Rejection failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Refresh admin data
    loadAdminData();
    
    toast({
      title: "Skill rejected!",
      description: `"${skillName}" has been rejected and removed from the platform.`,
    });
  };
  
  // Admin handler: Send platform-wide message
  const handleSendPlatformMessage = async (data: { title: string, message: string, type: string }) => {
    const { error } = await handleAsyncOperation(
      async () => {
        await adminAPI.sendPlatformMessage(data);
      },
      (error) => {
        logError(error, 'handleSendPlatformMessage');
        toast({
          title: "Message failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    toast({
      title: "Message sent!",
      description: "Platform message has been broadcast to all users.",
    });
  };
  
  // Admin handler: Download reports
  const handleDownloadReport = async (reportType: string) => {
    const { error } = await handleAsyncOperation(
      async () => {
        const response = await adminAPI.downloadReport(reportType);
        
        // Create download link
        const blob = new Blob([response.data], { 
          type: 'text/csv' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}_report.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        logError(error, 'handleDownloadReport');
        toast({
          title: "Download failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    toast({
      title: "Report downloaded!",
      description: `${reportType} report has been downloaded successfully.`,
    });
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    const { error } = await handleAsyncOperation(
      async () => {
        await notificationAPI.markAsRead(parseInt(notificationId));
      },
      (error) => {
        logError(error, 'handleMarkNotificationRead');
        toast({
          title: "Update failed",
          description: getUserFriendlyMessage(error),
          variant: "destructive",
        });
      }
    );

    if (error) {
      return;
    }
    
    // Refresh notifications
    loadNotifications();
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Render current page
  const renderCurrentPage = () => {
    // Pages without header/footer
    if (currentPage === "login") {
      return (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentPage("register")}
          isLoading={isLoading}
          error={error}
        />
      );
    }

    if (currentPage === "register") {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={() => setCurrentPage("login")}
          isLoading={isLoading}
          error={error}
        />
      );
    }

    // For pages with header/footer
    let pageContent;

    switch (currentPage) {
      case "home":
        // If the current user is an admin, redirect them to the admin page
        if (currentUser?.role === 'admin') {
          setCurrentPage("admin");
          return renderCurrentPage();
        }
        
        pageContent = (
          <HomePage
            users={users.filter(u => u.role !== 'admin')} // Filter out admin users
            currentUser={currentUser}
            searchTerm={searchTerm}
            availabilityFilter={availabilityFilter}
            onRequestSwap={handleRequestSwap}
            onViewProfile={handleViewProfile}
            onNavigate={handleNavigate}
            isAuthenticated={!!currentUser}
          />
        );
        break;
      case "profile":
        // Admin users shouldn't access regular user profiles
        if (currentUser?.role === 'admin') {
          setCurrentPage("admin");
          return renderCurrentPage();
        }
        
        // If no current user, show login prompt
        if (!currentUser) {
          setCurrentPage("login");
          return renderCurrentPage();
        }
        
        // Debug: Log the current user data being passed to ProfilePage
        console.log("Rendering ProfilePage with user:", currentUser);
        console.log("User skills offered:", currentUser.skillsOffered || currentUser.skills_offered);
        console.log("User skills wanted:", currentUser.skillsWanted || currentUser.skills_wanted);
        
        // Show loading state while fetching profile data
        if (isProfileLoading) {
          pageContent = (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading profile data...</p>
              </div>
            </div>
          );
        } else {
          pageContent = (
            <ProfilePage
              user={currentUser}
              onBack={() => handleNavigate("home")}
              onSave={handleUpdateProfile}
            />
          );
        }
        break;
      case "requests":
        // Admin users shouldn't access regular user requests
        if (currentUser?.role === 'admin') {
          setCurrentPage("admin");
          return renderCurrentPage();
        }
        
        pageContent = (
          <RequestsPage
            user={currentUser}
            onBack={() => handleNavigate("home")}
            requests={swapRequests}
            onUpdateRequest={handleUpdateRequest}
            onSubmitRating={handleSubmitRating}
          />
        );
        break;
      case "user-profile":
        // Admin users shouldn't access user profiles in the normal view
        if (currentUser?.role === 'admin') {
          setCurrentPage("admin");
          return renderCurrentPage();
        }
        
        const viewingUser = users.find(u => u.id === viewingUserId);
        pageContent = (
          <UserProfilePage
            user={viewingUser}
            currentUser={currentUser}
            onBack={() => handleNavigate("home")}
            onRequestSwap={handleRequestSwap}
          />
        );
        break;
      case "admin":
        // Only admin users can access admin page
        if (currentUser?.role !== 'admin') {
          setCurrentPage("home");
          return renderCurrentPage();
        }
        
        pageContent = (
          <AdminPage
            user={currentUser}
            onBack={() => handleNavigate("home")}
            users={users.filter(u => u.role !== 'admin')} // Filter out admin users from the list but include banned users
            requests={swapRequests}
            dashboard={dashboardData}
            onDeleteUser={handleDeleteUser}
            onBanUser={handleBanUser}
            onUnbanUser={handleUnbanUser}
            onToggleUserVisibility={handleToggleUserVisibility}
            onRejectSkill={handleRejectSkill}
            onSendPlatformMessage={handleSendPlatformMessage}
            onDownloadReport={handleDownloadReport}
          />
        );
        break;
      default:
        // For admin users, redirect to admin page for any unknown route
        if (currentUser?.role === 'admin') {
          setCurrentPage("admin");
          return renderCurrentPage();
        }
        pageContent = <div>Page not found</div>;
    }

    return (
      <>
        <Header
          user={currentUser}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onNavigate={handleNavigate}
          onLogin={() => setCurrentPage("login")}
          onLogout={handleLogout}
          notifications={notifications}
          currentPage={currentPage}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          availabilityFilter={availabilityFilter}
          onAvailabilityFilterChange={setAvailabilityFilter}
          onMarkNotificationRead={handleMarkNotificationRead}
        />
        <main className="flex-grow">{pageContent}</main>
        <Footer />
      </>
    );
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark' : ''}`}>
      {renderCurrentPage()}
    </div>
  );
};

export default Index;
