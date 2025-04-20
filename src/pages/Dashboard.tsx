
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecoveryGraph from "@/components/RecoveryGraph";
import { Activity, Clock, Pill, HeartPulse, Brain, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Treatment {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string;
}

const Dashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        // Get patient data
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (patientError) throw patientError;

        // Get treatments
        const { data: treatments, error: treatmentsError } = await supabase
          .from('treatments')
          .select('*')
          .eq('patientid', patientData.patientid);

        if (treatmentsError) throw treatmentsError;

        // Get latest recovery log
        const { data: latestLog, error: logError } = await supabase
          .from('recoverylogs')
          .select('*')
          .eq('patientid', patientData.patientid)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (logError && !logError.message.includes('No rows found')) throw logError;

        setUserData({
          id: user.id,
          name: patientData.name,
          treatments: treatments.map((t: any) => ({
            id: t.treatmentid,
            name: t.medication || t.therapy,
            dosage: t.therapy,
            frequency: t.duration ? `${t.duration} days` : 'As needed'
          })),
          // Use current date if no patient record creation date is available
          recoveryStartDate: new Date().toISOString(),
          recentMetrics: {
            pain: latestLog ? parseInt(latestLog.painlevels || '0') : 0,
            mobility: latestLog ? parseInt(latestLog.mobilitystatus || '0') : 0,
            mental: latestLog ? parseInt(latestLog.notes?.split(':')[1]?.trim() || '0') : 0
          }
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Only calculate days in recovery if userData exists
  const daysInRecovery = userData?.recoveryStartDate ? 
    Math.floor((new Date().getTime() - new Date(userData.recoveryStartDate).getTime()) / (1000 * 3600 * 24)) : 0;
  
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If userData is null after loading, show an error message
  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to load dashboard</h2>
          <p className="text-muted-foreground mb-4">Could not retrieve your patient data. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Recovery Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and monitor your recovery journey
          </p>
        </div>
        <Link to="/log">
          <Button className="mt-4 md:mt-0">
            Log Today's Metrics
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex p-6">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Days in Recovery</p>
              <h3 className="text-2xl font-bold">{daysInRecovery}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex p-6">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Pain Level</p>
              <h3 className="text-2xl font-bold">{userData.recentMetrics.pain}/10</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex p-6">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mental Health</p>
              <h3 className="text-2xl font-bold">{userData.recentMetrics.mental}/10</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex p-6">
            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mr-4">
              <Pill className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Treatments</p>
              <h3 className="text-2xl font-bold">{userData.treatments.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RecoveryGraph className="lg:col-span-2" userId={userData.id} />
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Next Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {userData.nextAppointment ? (
                <div className="space-y-2">
                  <div className="flex items-center text-primary">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-medium">{formatAppointmentDate(userData.nextAppointment)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    With Dr. Smith at Memorial Hospital
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" size="sm">
                      Manage Appointments
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>No upcoming appointments</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Current Treatments</CardTitle>
              <CardDescription>Your active medication and treatments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData.treatments.map((treatment) => (
                <div key={treatment.id} className="flex items-start space-x-3 p-2 rounded-md bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Pill className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{treatment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {treatment.dosage && `${treatment.dosage}, `}{treatment.frequency}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="link" className="px-0" size="sm">
                <Link to="/profile">View all in Profile →</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Recovery Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <HeartPulse className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm">Maintain consistent sleep patterns to improve recovery outcomes.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm">Log your metrics at the same time each day for accurate tracking.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
