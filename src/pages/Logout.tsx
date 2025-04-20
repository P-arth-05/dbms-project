
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Logout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut();
        toast.success("Successfully logged out");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Failed to log out. Please try again.");
      } finally {
        navigate("/login");
      }
    };

    performLogout();
  }, [signOut, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <p className="text-lg">Logging you out...</p>
        <p className="text-sm text-muted-foreground">You will be redirected shortly.</p>
      </div>
    </div>
  );
};

export default Logout;
