import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface RecoveryData {
  date: string;
  formattedDate: string;
  painLevel: number;
  heartRate: number;
  mobility: number;
  mentalHealth: number;
  recoveryScore: number;
}

interface RecoveryGraphProps {
  userId?: string;
  className?: string;
}

const RecoveryGraph = ({ userId, className }: RecoveryGraphProps) => {
  const [data, setData] = useState<RecoveryData[]>([]);
  const [timePeriod, setTimePeriod] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Calculate stats from data
  const currentScore = data.length > 0 ? data[data.length - 1].recoveryScore : 0;
  const previousScore = data.length > 1 ? data[data.length - 2].recoveryScore : 0;
  const scoreChange = currentScore - previousScore;
  const isImproved = scoreChange >= 0;
  
  // Calculate weekly average
  const weeklyAverage = data.length > 0 
    ? Math.round(data.slice(-7).reduce((sum, entry) => sum + entry.recoveryScore, 0) / Math.min(7, data.length))
    : 0;

  useEffect(() => {
    const fetchRecoveryData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // First get the patient ID
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('patientid')
          .eq('user_id', user.id)
          .single();

        if (patientError) throw patientError;

        // Then fetch recovery logs
        const daysToFetch = parseInt(timePeriod) || 7;
        const { data: logs, error: logsError } = await supabase
          .from('recoverylogs')
          .select('*')
          .eq('patientid', patientData.patientid)
          .order('date', { ascending: true })
          .limit(daysToFetch);

        if (logsError) throw logsError;

        const formattedData = logs.map(log => ({
          date: log.date,
          formattedDate: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          painLevel: parseInt(log.painlevels || '0'),
          heartRate: JSON.parse(log.vitalsigns || '{"heartRate": 0}').heartRate,
          mobility: parseInt(log.mobilitystatus || '0'),
          mentalHealth: parseInt(log.notes?.split(':')[1]?.trim() || '0'),
          recoveryScore: parseInt(log.adherence || '0')
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching recovery data:', error);
        // toast.error('Failed to load recovery data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecoveryData();
  }, [timePeriod, user?.id]);

  return (
    <Card className={`${className || ''} shadow-sm`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-semibold">Recovery Progress</CardTitle>
          <CardDescription>Track your healing journey over time</CardDescription>
        </div>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            {[{ value: "7", label: "Last 7 days" }, { value: "14", label: "Last 14 days" }, { value: "30", label: "Last 30 days" }].map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Current Score</div>
            <div className="text-2xl font-bold">{currentScore}%</div>
            <div className={`text-sm flex items-center mt-1 ${isImproved ? 'text-green-600' : 'text-red-600'}`}>
              {isImproved ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
              {Math.abs(scoreChange)}% {isImproved ? 'improved' : 'decreased'}
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Weekly Average</div>
            <div className="text-2xl font-bold">{weeklyAverage}%</div>
            <div className="text-sm text-muted-foreground mt-1">Last 7 days</div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Last Updated</div>
            <div className="text-2xl font-bold">{data.length > 0 ? data[data.length - 1].formattedDate : "N/A"}</div>
            <div className="text-sm text-muted-foreground mt-1">Recovery entry</div>
          </div>
        </div>
        
        <Tabs defaultValue="line">
          <TabsList className="mb-4">
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="line" className="h-[300px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="formattedDate" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="recoveryScore" 
                    name="Recovery Score" 
                    stroke="#4056A1" 
                    strokeWidth={3} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="painLevel" 
                    name="Pain (0-10)" 
                    stroke="#D79922" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          
          <TabsContent value="bar" className="h-[300px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="formattedDate" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="recoveryScore" name="Recovery Score" fill="#4056A1" />
                  <Bar dataKey="mobility" name="Mobility (0-10)" fill="#D79922" />
                  <Bar dataKey="mentalHealth" name="Mental Health (0-10)" fill="#6B8E23" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-md shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default RecoveryGraph;
