
import MetricForm from "@/components/MetricForm";

const RecoveryLog = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Log Your Recovery</h1>
      <p className="text-muted-foreground mb-8">
        Track your daily health metrics to monitor your recovery journey
      </p>
      
      <MetricForm />
    </div>
  );
};

export default RecoveryLog;
