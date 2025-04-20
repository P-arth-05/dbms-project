
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MetricFormProps {
  userId?: string;
  onSuccess?: () => void;
}

const MetricForm = ({ userId, onSuccess }: MetricFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [painLevel, setPainLevel] = useState<number>(5);
  const [heartRate, setHeartRate] = useState<string>('75');
  const [mobilityScale, setMobilityScale] = useState<number>(5);
  const [mentalHealth, setMentalHealth] = useState<number>(5);
  
  // Handle numeric input validation
  const handleHeartRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setHeartRate(value);
    }
  };
  
  // Calculate recovery score
  const calculateRecoveryScore = () => {
    // Convert pain scale to recovery scale (10 pain = 0 recovery, 0 pain = 100 recovery)
    const painScore = 100 - (painLevel * 10);
    
    // Convert mobility scale to percentage (0-10 to 0-100%)
    const mobilityScore = mobilityScale * 10;
    
    // Convert mental health scale to percentage
    const mentalScore = mentalHealth * 10;
    
    // Simple average of the three scores
    return Math.round((painScore + mobilityScore + mentalScore) / 3);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate heart rate
    const heartRateNum = parseInt(heartRate);
    if (isNaN(heartRateNum) || heartRateNum < 30 || heartRateNum > 220) {
      toast.error("Please enter a valid heart rate between 30-220 BPM");
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculate recovery score
      const recoveryScore = calculateRecoveryScore();

      // First get the patient ID for the current user
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('patientid')
        .eq('user_id', user?.id)
        .single();

      if (patientError) {
        throw new Error('Could not find patient record');
      }

      // Save to recoverylogs table
      const { error } = await supabase
        .from('recoverylogs')
        .insert({
          patientid: patientData.patientid,
          date: new Date().toISOString().split('T')[0],
          painlevels: painLevel.toString(),
          vitalsigns: JSON.stringify({ heartRate: heartRateNum }),
          mobilitystatus: mobilityScale.toString(),
          notes: `Mental Health Index: ${mentalHealth}/10`,
          adherence: recoveryScore.toString()
        });

      if (error) throw error;
      
      toast.success("Recovery metrics logged successfully!");
      
      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error logging metrics:", error);
      toast.error("Failed to log metrics. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Log Today's Recovery Metrics</CardTitle>
        <CardDescription>
          Track your recovery progress by entering today's health metrics
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Pain Level */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="pain-level">Pain Level</Label>
              <span className="text-sm font-medium">{painLevel}/10</span>
            </div>
            <Slider
              id="pain-level"
              min={0}
              max={10}
              step={1}
              value={[painLevel]}
              onValueChange={(vals) => setPainLevel(vals[0])}
              className="metric-slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>No Pain (0)</span>
              <span>Worst Pain (10)</span>
            </div>
          </div>
          
          {/* Heart Rate */}
          <div className="space-y-2">
            <Label htmlFor="heart-rate">Heart Rate (BPM)</Label>
            <Input 
              id="heart-rate" 
              type="text" 
              value={heartRate} 
              onChange={handleHeartRateChange}
              className="form-input"
              placeholder="Enter heart rate"
            />
          </div>
          
          {/* Mobility Scale */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="mobility-scale">Mobility Scale</Label>
              <span className="text-sm font-medium">{mobilityScale}/10</span>
            </div>
            <Slider
              id="mobility-scale"
              min={0}
              max={10}
              step={1}
              value={[mobilityScale]}
              onValueChange={(vals) => setMobilityScale(vals[0])}
              className="metric-slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Limited (0)</span>
              <span>Full Mobility (10)</span>
            </div>
          </div>
          
          {/* Mental Health */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="mental-health">Mental Health Index</Label>
              <span className="text-sm font-medium">{mentalHealth}/10</span>
            </div>
            <Slider
              id="mental-health"
              min={0}
              max={10}
              step={1}
              value={[mentalHealth]}
              onValueChange={(vals) => setMentalHealth(vals[0])}
              className="metric-slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Struggling (0)</span>
              <span>Excellent (10)</span>
            </div>
          </div>
          
          <div className="pt-2 text-center">
            <p className="text-sm text-muted-foreground mb-1">Calculated Recovery Score</p>
            <div className="text-3xl font-bold text-primary">{calculateRecoveryScore()}%</div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Log Metrics"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MetricForm;
