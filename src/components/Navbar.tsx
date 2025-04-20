
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LineChart, Home, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  // Only show navbar links if user is logged in (not on landing or auth pages)
  const isLoggedIn = !['/', '/login', '/signup'].includes(location.pathname);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out");
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <LineChart size={24} className="text-primary" />
            <span className="text-xl font-semibold tracking-tight">RecoverTrack</span>
          </Link>
        </div>

        {isLoggedIn ? (
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/dashboard' ? 'text-primary' : 'text-foreground/80'}`}>
              Dashboard
            </Link>
            <Link to="/profile" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/profile' ? 'text-primary' : 'text-foreground/80'}`}>
              Profile
            </Link>
            <Link to="/log" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/log' ? 'text-primary' : 'text-foreground/80'}`}>
              Log Metrics
            </Link>
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </div>
              <div className="md:hidden flex">
                <nav className="flex items-center gap-4">
                  <Link to="/dashboard" className={`p-2 ${location.pathname === '/dashboard' ? 'text-primary' : 'text-foreground/80'}`}>
                    <Home size={20} />
                  </Link>
                  <Link to="/profile" className={`p-2 ${location.pathname === '/profile' ? 'text-primary' : 'text-foreground/80'}`}>
                    <User size={20} />
                  </Link>
                  <Link to="/log" className={`p-2 ${location.pathname === '/log' ? 'text-primary' : 'text-foreground/80'}`}>
                    <LineChart size={20} />
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" size="icon" className="p-2">
                    <LogOut size={20} />
                  </Button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
