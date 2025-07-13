import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToRegister: () => void;
  isLoading?: boolean;
  error?: string;
}

export function LoginPage({ onLogin, onNavigateToRegister, isLoading, error }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  const setDemoCredentials = (username: string, pwd: string) => {
    setEmail(username);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-muted-foreground">
            Sign in to your SkillSwap account
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start space-x-2">
              <div className="text-destructive mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          {/* Demo credentials alert */}
          <Alert variant="default" className="bg-muted/50 border-primary/10">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle>Demo Credentials</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-3">
                <p className="text-sm"><strong>Regular Users:</strong></p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDemoCredentials('johnmartinez@example.com', 'password123')}
                    disabled={isLoading}
                  >
                    Login as John
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDemoCredentials('sarahchen@example.com', 'password123')}
                    disabled={isLoading}
                  >
                    Login as Sarah
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDemoCredentials('priyapatel@example.com', 'password123')}
                    disabled={isLoading}
                  >
                    Login as Priya
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDemoCredentials('ahmedhassan@example.com', 'password123')}
                    disabled={isLoading}
                  >
                    Login as Ahmed
                  </Button>
                </div>
                <p className="text-sm"><strong>Admin User:</strong></p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDemoCredentials('admin@swapskill.com', 'admin123')}
                  className="bg-primary/10"
                  disabled={isLoading}
                >
                  Login as Admin
                </Button>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Note: Please use your email address to login.</p>
                  <p><strong>Admin Access:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Reject inappropriate skill descriptions</li>
                    <li>Ban users who violate policies</li>
                    <li>Monitor swap requests (pending/accepted/cancelled)</li>
                    <li>Send platform-wide messages</li>
                    <li>Download activity reports</li>
                  </ul>
                  <p className="mt-2"><strong>Regular Users:</strong> Access to all member features</p>
                  <p>Click any button above to auto-fill login credentials.</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary"
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button 
                variant="link" 
                className="p-0 text-sm"
                disabled={isLoading}
              >
                Forgot password?
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="default"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : "Sign In"}
            </Button>
          </form>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                className="p-0" 
                onClick={onNavigateToRegister}
                disabled={isLoading}
              >
                Sign up here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}