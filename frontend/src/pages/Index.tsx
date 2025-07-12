import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/components/pages/HomePage";
import { LoginPage } from "@/components/pages/LoginPage";
import { RegisterPage } from "@/components/pages/RegisterPage";
import { ProfilePage } from "@/components/pages/ProfilePage";
import { RequestsPage } from "@/components/pages/RequestsPage";
import { AdminPage } from "@/components/pages/AdminPage";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [swapRequests, setSwapRequests] = useState<any[]>([]);
  const { toast } = useToast();

  // Mock users data - comprehensive skill swap platform dataset
  const [users] = useState([
    {
      id: "1",
      name: "John Martinez",
      email: "john@example.com", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      location: "San Francisco, CA",
      rating: 4.8,
      totalSwaps: 23,
      skillsOffered: ["UI/UX Design", "Figma", "Adobe Creative Suite", "User Research"],
      skillsWanted: ["React", "Python", "Data Science", "Guitar"],
      availability: "available",
      bio: "Senior UX Designer passionate about creating intuitive digital experiences. Love helping others discover the joy of good design.",
      badges: ["First Swap", "5-Star Teacher", "Design Guru"],
      lastActive: "2 hours ago",
      isPublic: true,
    },
    {
      id: "2", 
      name: "Sarah Chen",
      email: "sarah@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612d7c7?w=150&h=150&fit=crop&crop=face",
      location: "Seattle, WA",
      rating: 4.9,
      totalSwaps: 31,
      skillsOffered: ["React", "Node.js", "TypeScript", "System Design"],
      skillsWanted: ["Machine Learning", "Photography", "French", "Cooking"],
      availability: "available",
      bio: "Full-stack developer with 8 years experience. I love teaching coding and learning new skills from amazing people.",
      badges: ["Code Master", "Top Rated", "Community Champion"],
      lastActive: "1 hour ago",
      isPublic: true,
    },
    {
      id: "3",
      name: "Ahmed Hassan", 
      email: "ahmed@example.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      location: "Dubai, UAE",
      rating: 4.7,
      totalSwaps: 18,
      skillsOffered: ["Digital Marketing", "SEO", "Arabic", "Public Speaking"],
      skillsWanted: ["Web Development", "Graphic Design", "Video Editing"],
      availability: "busy",
      bio: "Marketing strategist and polyglot. I help businesses grow online and love connecting with people from different cultures.",
      badges: ["Marketing Pro", "Language Master"],
      lastActive: "3 hours ago",
      isPublic: true,
    },
    {
      id: "4",
      name: "Emily Rodriguez",
      email: "emily@example.com", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      location: "Barcelona, Spain",
      rating: 4.6,
      totalSwaps: 15,
      skillsOffered: ["Spanish", "Guitar", "Photography", "Travel Planning"],
      skillsWanted: ["Python", "Data Analysis", "Digital Art", "Yoga"],
      availability: "available",
      bio: "Travel photographer and music teacher. Born in Mexico, living in Spain. Always excited to share my culture and learn about others!",
      badges: ["Cultural Ambassador", "Creative Spirit"],
      lastActive: "30 minutes ago",
      isPublic: true,
    },
    {
      id: "5",
      name: "David Kim",
      email: "david@example.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", 
      location: "Toronto, Canada",
      rating: 4.9,
      totalSwaps: 42,
      skillsOffered: ["Python", "Machine Learning", "Data Science", "Statistics"],
      skillsWanted: ["Japanese", "Piano", "Rock Climbing", "Meditation"],
      availability: "available",
      bio: "Data scientist at a fintech startup. I believe data can solve world problems, but work-life balance is equally important.",
      badges: ["Data Wizard", "Swap Legend", "Mentor"],
      lastActive: "45 minutes ago",
      isPublic: true,
    },
    {
      id: "6",
      name: "Luna Andersson",
      email: "luna@example.com",
      avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face",
      location: "Stockholm, Sweden", 
      rating: 4.8,
      totalSwaps: 27,
      skillsOffered: ["Swedish", "Interior Design", "Sustainable Living", "Woodworking"],
      skillsWanted: ["App Development", "Mandarin", "Pottery", "Vegan Cooking"],
      availability: "available",
      bio: "Sustainable design consultant who creates beautiful, eco-friendly spaces. Passionate about minimalism and zero-waste living.",
      badges: ["Eco Warrior", "Design Pro", "Scandinavian Style"],
      lastActive: "1 hour ago",
      isPublic: true,
    },
    {
      id: "7",
      name: "Carlos Mendoza",
      email: "carlos@example.com", 
      avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
      location: "Mexico City, Mexico",
      rating: 4.5,
      totalSwaps: 12,
      skillsOffered: ["Cooking", "Spanish", "Salsa Dancing", "Business Strategy"],
      skillsWanted: ["German", "3D Modeling", "Investing", "Public Speaking"],
      availability: "busy",
      bio: "Chef and restaurant owner. I love sharing the authentic flavors of Mexican cuisine and learning about business from other entrepreneurs.",
      badges: ["Master Chef", "Business Minded"],
      lastActive: "4 hours ago",
      isPublic: true,
    },
    {
      id: "8",
      name: "Priya Patel",
      email: "priya@example.com",
      avatar: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=150&h=150&fit=crop&crop=face",
      location: "Mumbai, India",
      rating: 4.7,
      totalSwaps: 20,
      skillsOffered: ["Yoga", "Hindi", "Project Management", "Mindfulness"],
      skillsWanted: ["Graphic Design", "Italian", "Photography", "Blockchain"],
      availability: "available", 
      bio: "Certified yoga instructor and agile project manager. I help teams work better together and individuals find inner peace.",
      badges: ["Wellness Guru", "PM Expert", "Mindful Teacher"],
      lastActive: "2 hours ago",
      isPublic: true,
    },
    {
      id: "admin1",
      name: "Admin User",
      email: "admin@skillswap.com",
      avatar: "https://images.unsplash.com/photo-1519713958759-6254243c4a53?w=150&h=150&fit=crop&crop=face",
      location: "Platform HQ",
      rating: 5.0,
      totalSwaps: 0,
      skillsOffered: ["Platform Management", "Community Building"],
      skillsWanted: ["Feedback", "Ideas"],
      availability: "available",
      bio: "Platform administrator helping create the best skill-sharing experience.",
      badges: ["Admin", "Community Builder"],
      lastActive: "Online",
      isPublic: false,
      isAdmin: true,
    }
  ]);

  // Load user data and preferences from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("skillswap_user");
    const savedDarkMode = localStorage.getItem("skillswap_darkMode");
    const savedNotifications = localStorage.getItem("skillswap_notifications");
    const savedRequests = localStorage.getItem("skillswap_requests");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedRequests) {
      setSwapRequests(JSON.parse(savedRequests));
    }
  }, []);

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
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authentication handlers
  const handleLogin = (email: string, password: string) => {
    // Mock authentication logic
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("skillswap_user", JSON.stringify(user));
      setCurrentPage("home");
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
    } else {
      toast({
        title: "Login failed",
        description: "User not found. Try one of the demo accounts.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = (data: any) => {
    // Mock registration logic
    const newUser = {
      id: `user_${Date.now()}`,
      ...data,
      rating: 0,
      totalSwaps: 0,
      badges: ["New Member"],
      lastActive: "Just now",
      isPublic: true,
    };
    
    setCurrentUser(newUser);
    localStorage.setItem("skillswap_user", JSON.stringify(newUser));
    setCurrentPage("home");
    toast({
      title: "Account created!",
      description: "Welcome to SkillSwap! Start exploring skills to learn.",
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("skillswap_user");
    setCurrentPage("home");
    toast({
      title: "Logged out",
      description: "Thanks for using SkillSwap!",
    });
  };

  // Skill swap request handler
  const handleRequestSwap = async (data: any) => {
    const newRequest = {
      id: `req_${Date.now()}`,
      ...data,
      fromUserId: currentUser.id,
      fromUser: currentUser,
      toUser: users.find(u => u.id === data.targetUserId),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updatedRequests = [...swapRequests, newRequest];
    setSwapRequests(updatedRequests);
    localStorage.setItem("skillswap_requests", JSON.stringify(updatedRequests));

    // Add notification for target user (mock)
    const newNotification = {
      id: `notif_${Date.now()}`,
      title: "New Swap Request",
      message: `${currentUser.name} wants to swap skills with you!`,
      time: "Just now",
      read: false,
      type: "swap_request",
      requestId: newRequest.id,
    };

    const updatedNotifications = [...notifications, newNotification];
    setNotifications(updatedNotifications);
    localStorage.setItem("skillswap_notifications", JSON.stringify(updatedNotifications));

    toast({
      title: "Request sent!",
      description: `Your swap request has been sent to ${newRequest.toUser.name}`,
    });
  };

  const handleViewProfile = (userId: string) => {
    // For demo, just show a toast - in real app would navigate to profile view
    const user = users.find(u => u.id === userId);
    toast({
      title: "Profile View",
      description: `Viewing ${user?.name}'s profile (feature coming soon)`,
    });
  };

  const handleUpdateProfile = (data: any) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      localStorage.setItem("skillswap_user", JSON.stringify(updatedUser));
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
    }
  };

  const handleUpdateRequest = (requestId: string, status: string) => {
    const updatedRequests = swapRequests.map(req =>
      req.id === requestId ? { ...req, status } : req
    );
    setSwapRequests(updatedRequests);
    localStorage.setItem("skillswap_requests", JSON.stringify(updatedRequests));
    
    const request = swapRequests.find(r => r.id === requestId);
    if (request) {
      const actionText = status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'completed';
      toast({
        title: `Request ${actionText}!`,
        description: `Swap request has been ${actionText}.`,
      });

      // Add notification for the other user
      const newNotification = {
        id: `notif_${Date.now()}`,
        title: `Request ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        message: `Your swap request has been ${actionText}!`,
        time: "Just now",
        read: false,
        type: "request_update",
        requestId: requestId,
      };

      const updatedNotifications = [...notifications, newNotification];
      setNotifications(updatedNotifications);
      localStorage.setItem("skillswap_notifications", JSON.stringify(updatedNotifications));
    }
  };

  const handleSubmitRating = (requestId: string, rating: number, feedback: string) => {
    const updatedRequests = swapRequests.map(req =>
      req.id === requestId ? { ...req, rated: true, rating, feedback } : req
    );
    setSwapRequests(updatedRequests);
    localStorage.setItem("skillswap_requests", JSON.stringify(updatedRequests));
    
    toast({
      title: "Rating submitted!",
      description: "Thank you for your feedback.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    // For demo - in real app would require backend API
    toast({
      title: "User deleted",
      description: "User has been removed from the platform.",
    });
  };

  const handleToggleUserVisibility = (userId: string) => {
    // For demo - in real app would require backend API
    toast({
      title: "User visibility updated",
      description: "User visibility status has been changed.",
    });
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("skillswap_notifications", JSON.stringify(updatedNotifications));
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
        />
      );
    }
    
    if (currentPage === "register") {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={() => setCurrentPage("login")}
        />
      );
    }

    if (currentPage === "profile") {
      return (
        <ProfilePage
          user={currentUser}
          onBack={() => setCurrentPage("home")}
          onSave={handleUpdateProfile}
        />
      );
    }

    if (currentPage === "requests") {
      return (
        <RequestsPage
          user={currentUser}
          onBack={() => setCurrentPage("home")}
          requests={swapRequests}
          onUpdateRequest={handleUpdateRequest}
          onSubmitRating={handleSubmitRating}
        />
      );
    }

    if (currentPage === "admin") {
      return (
        <AdminPage
          user={currentUser}
          onBack={() => setCurrentPage("home")}
          users={users}
          requests={swapRequests}
          onDeleteUser={handleDeleteUser}
          onToggleUserVisibility={handleToggleUserVisibility}
        />
      );
    }

    // Pages with header/footer (home and others)
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          user={currentUser}
          onLogin={() => setCurrentPage("login")}
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          availabilityFilter={availabilityFilter}
          onAvailabilityFilterChange={setAvailabilityFilter}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
        />
        <main className="flex-1 container mx-auto px-4 py-8">
          <HomePage
            users={users}
            currentUser={currentUser}
            searchTerm={searchTerm}
            availabilityFilter={availabilityFilter}
            onRequestSwap={handleRequestSwap}
            onViewProfile={handleViewProfile}
          />
        </main>
        <Footer />
      </div>
    );
  };

  return renderCurrentPage();
};

export default Index;
