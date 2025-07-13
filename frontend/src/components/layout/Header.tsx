import { useState } from "react";
import { Search, Bell, User, Moon, Sun, Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isAdmin } from "@/utils/userHelpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availabilityFilter: string;
  onAvailabilityFilterChange: (value: string) => void;
  notifications: any[];
  onMarkNotificationRead: (id: string) => void;
}

export function Header({
  user,
  onLogin,
  onLogout,
  darkMode,
  onToggleDarkMode,
  currentPage,
  onNavigate,
  searchTerm,
  onSearchChange,
  availabilityFilter,
  onAvailabilityFilterChange,
  notifications,
  onMarkNotificationRead,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity"
            >
              <Home className="h-6 w-6" />
              <span className="hidden sm:block">SkillSwap</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button
              variant={currentPage === 'home' ? 'secondary' : 'ghost'}
              onClick={() => onNavigate('home')}
            >
              Browse Skills
            </Button>
            {user && (
              <>
                {/* Show regular user navigation only for non-admin users */}
                {user.role !== 'admin' && (
                  <>
                    <Button
                      variant={currentPage === 'requests' ? 'secondary' : 'ghost'}
                      onClick={() => onNavigate('requests')}
                    >
                      My Requests
                    </Button>
                    <Button
                      variant={currentPage === 'profile' ? 'secondary' : 'ghost'}
                      onClick={() => onNavigate('profile')}
                    >
                      My Profile
                    </Button>
                  </>
                )}
                {/* Show admin navigation only for admin users */}
                {user.role === 'admin' && (
                  <Button
                    variant={currentPage === 'admin' ? 'secondary' : 'ghost'}
                    onClick={() => onNavigate('admin')}
                  >
                    Admin Panel
                  </Button>
                )}
              </>
            )}
          </nav>

          {/* Search and Filters - Only show for non-admin users */}
          {user?.role !== 'admin' && (
            <div className="flex items-center space-x-2 flex-1 max-w-md mx-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={availabilityFilter} onValueChange={onAvailabilityFilterChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 font-semibold">Notifications</div>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <>
                      {notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`p-3 cursor-pointer ${!notification.read ? 'bg-primary-light' : ''}`}
                          onClick={() => onMarkNotificationRead(notification.id)}
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {notifications.length > 5 && (
                        <DropdownMenuItem className="p-2 text-center text-primary">
                          View all notifications
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <span className="hidden sm:block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Show regular user options only for non-admin users */}
                  {user.role !== 'admin' && (
                    <>
                      <DropdownMenuItem onClick={() => onNavigate('profile')}>
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate('requests')}>
                        My Requests
                      </DropdownMenuItem>
                    </>
                  )}
                  {/* Show admin options only for admin users */}
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => onNavigate('admin')}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={onLogin} variant="request">
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              <Button
                variant={currentPage === 'home' ? 'secondary' : 'ghost'}
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                Browse Skills
              </Button>
              {user && (
                <>
                  {/* Show regular user navigation only for non-admin users */}
                  {user.role !== 'admin' && (
                    <>
                      <Button
                        variant={currentPage === 'requests' ? 'secondary' : 'ghost'}
                        onClick={() => {
                          onNavigate('requests');
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        My Requests
                      </Button>
                      <Button
                        variant={currentPage === 'profile' ? 'secondary' : 'ghost'}
                        onClick={() => {
                          onNavigate('profile');
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        My Profile
                      </Button>
                    </>
                  )}
                  {/* Show admin navigation only for admin users */}
                  {user.role === 'admin' && (
                    <Button
                      variant={currentPage === 'admin' ? 'secondary' : 'ghost'}
                      onClick={() => {
                        onNavigate('admin');
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Admin Panel
                    </Button>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}