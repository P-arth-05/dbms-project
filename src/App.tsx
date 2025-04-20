
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { SmoothScrollProvider } from "@/context/SmoothScrollContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Landing from "@/components/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MagicLink from "./pages/MagicLink";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import InitialInput from "./pages/InitialInput";
import RecoveryLog from "./pages/RecoveryLog";
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SmoothScrollProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/magic-link" element={<MagicLink />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/initial" element={<InitialInput />} />
                  <Route path="/log" element={<RecoveryLog />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </SmoothScrollProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
