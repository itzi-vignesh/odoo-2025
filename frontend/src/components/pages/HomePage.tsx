import { useState, useMemo } from "react";
import { UserCard } from "@/components/profile/UserCard";
import { SwapRequestModal } from "@/components/modals/SwapRequestModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Users, Search, Clock } from "lucide-react";

interface HomePageProps {
  users: any[];
  currentUser: any;
  searchTerm: string;
  availabilityFilter: string;
  onRequestSwap: (data: any) => void;
  onViewProfile: (userId: string) => void;
  onNavigate?: (page: string) => void;
  isAuthenticated?: boolean;
}

export function HomePage({
  users,
  currentUser,
  searchTerm,
  availabilityFilter,
  onRequestSwap,
  onViewProfile,
  onNavigate,
  isAuthenticated = false
}: HomePageProps) {
  const [selectedUserForRequest, setSelectedUserForRequest] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 12;

  // Admin users should not access the home page
  if (currentUser?.role === 'admin') {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <h3 className="text-lg font-medium">Admin Access Restricted</h3>
          <p className="text-sm">
            Admin users should use the Admin Panel to manage the platform.
          </p>
        </div>
      </div>
    );
  }

  const handleSignUpClick = () => {
    if (onNavigate) {
      onNavigate('register');
    }
  };
  
  const handleRegister = () => {
    if (onNavigate) {
      onNavigate('register');
    }
  };

  // Filter users based on search and availability
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Don't show current user
      if (currentUser && user.id === currentUser.id) return false;
      
      // Filter by availability
      if (availabilityFilter !== 'all' && user.availability !== availabilityFilter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const skillsOffered = user.skillsOffered || user.skills_offered || [];
        const skillsWanted = user.skillsWanted || user.skills_wanted || [];
        
        return (
          (user.name || user.username || '').toLowerCase().includes(searchLower) ||
          skillsOffered.some((skill: any) => 
            (typeof skill === 'string' ? skill : skill.skill_name || '').toLowerCase().includes(searchLower)
          ) ||
          skillsWanted.some((skill: any) => 
            (typeof skill === 'string' ? skill : skill.skill_name || '').toLowerCase().includes(searchLower)
          ) ||
          (user.bio || '').toLowerCase().includes(searchLower) ||
          (user.location || '').toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [users, currentUser, searchTerm, availabilityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handleRequestSwap = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUserForRequest(user);
    }
  };

  const handleSubmitRequest = async (data: any) => {
    await onRequestSwap(data);
    setSelectedUserForRequest(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8 bg-gradient-to-r from-primary-light to-secondary rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Discover Amazing Skills
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with talented individuals, share your expertise, and learn new skills 
          through our peer-to-peer skill exchange platform.
        </p>
        {!currentUser && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">
              Join our community to start swapping skills and connect with others
            </p>
            <Button variant="default" size="lg" onClick={handleRegister} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign Up Now
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
            <div className="text-sm text-muted-foreground">Matching Profiles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              {users.filter(u => u.availability === 'available').length}
            </div>
            <div className="text-sm text-muted-foreground">Available Now</div>
          </CardContent>
        </Card>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {searchTerm || availabilityFilter !== 'all' ? 'Search Results' : 'All Members'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
        
        {totalPages > 1 && (
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* User Grid */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No members available</h3>
            <p className="text-sm">
              There are currently no members in the system.
            </p>
          </div>
        </div>
      ) : paginatedUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUser={currentUser}
              onRequestSwap={handleRequestSwap}
              onViewProfile={onViewProfile}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No members found</h3>
            <p className="text-sm">
              {searchTerm 
                ? `No results for "${searchTerm}". Try different keywords.`
                : availabilityFilter !== 'all'
                ? `No ${availabilityFilter} members found.`
                : 'Currently there are no members matching your criteria.'
              }
            </p>
          </div>
          {(searchTerm || availabilityFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                window.location.href = '/?reset=true';
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Swap Request Modal */}
      <SwapRequestModal
        isOpen={!!selectedUserForRequest}
        onClose={() => setSelectedUserForRequest(null)}
        targetUser={selectedUserForRequest}
        currentUser={currentUser}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
}