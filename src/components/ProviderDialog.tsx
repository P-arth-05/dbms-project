
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProviderFormData {
  name: string;
  specialty: string;
  phone: string;
}

interface ProviderDialogProps {
  provider: ProviderFormData;
  setProvider: (provider: ProviderFormData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProviderDialog = ({
  provider,
  setProvider,
  onSave,
  onCancel,
}: ProviderDialogProps) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="providerName">Provider Name</Label>
        <Input
          id="providerName"
          value={provider.name}
          onChange={(e) => setProvider({ ...provider, name: e.target.value })}
          placeholder="e.g., Dr. Sarah Smith"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="specialty">Specialty</Label>
        <Input
          id="specialty"
          value={provider.specialty}
          onChange={(e) => setProvider({ ...provider, specialty: e.target.value })}
          placeholder="e.g., Orthopedic Surgeon"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="providerPhone">Phone</Label>
        <Input
          id="providerPhone"
          value={provider.phone}
          onChange={(e) => setProvider({ ...provider, phone: e.target.value })}
          placeholder="e.g., 555-123-4567"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>Save Provider</Button>
      </DialogFooter>
    </div>
  );
};
