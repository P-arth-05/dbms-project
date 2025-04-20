import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash2, User, Phone, UserCircle, Building, Pill } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import EditDialog from "@/components/EditDialog";
import { ProviderDialog } from "@/components/ProviderDialog";

interface HealthcareProvider {
  id: string;
  name: string;
  specialty: string;
  phone: string;
}

interface ProfileData {
  patientid: string;
  name: string;
  dob: string;
  gender: string | null;
  contact: string;
  address: string | null;
  medicalhistory: string | null;
  lifestylefactors: string | null;
  healthcareProvider: HealthcareProvider | null;
  familyMembers: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
  }>;
  treatments: Array<{
    id: string;
    name: string;
    dosage: string | null;
    frequency: string;
    notes: string | null;
  }>;
}

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
  
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [newMedicationForm, setNewMedicationForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    notes: ""
  });
  
  const [provider, setProvider] = useState({
    name: "",
    specialty: "",
    phone: "",
  });
  
  const [editingFamilyMember, setEditingFamilyMember] = useState<any>(null);
  const [newFamilyForm, setNewFamilyForm] = useState({
    name: "",
    relationship: "",
    phone: ""
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (patientError) throw patientError;

        const { data: providerData } = await supabase
          .from('healthcareproviders')
          .select('*')
          .eq('patientid', patientData.patientid)
          .maybeSingle();

        const { data: familyData } = await supabase
          .from('familymembers')
          .select('*')
          .eq('patientid', patientData.patientid);

        const { data: treatmentsData } = await supabase
          .from('treatments')
          .select('*')
          .eq('patientid', patientData.patientid);

        const transformedData: ProfileData = {
          ...patientData,
          healthcareProvider: providerData ? {
            id: providerData.providerid,
            name: providerData.name,
            specialty: providerData.specialization,
            phone: providerData.contact
          } : null,
          familyMembers: familyData ? familyData.map((member: any) => ({
            id: member.relationid,
            name: member.name,
            relationship: member.relationship,
            phone: member.contact
          })) : [],
          treatments: treatmentsData ? treatmentsData.map((treatment: any) => ({
            id: treatment.treatmentid,
            name: treatment.medication || "Unknown treatment",
            dosage: treatment.therapy ? treatment.therapy.split('-')[0].trim() : null,
            frequency: treatment.therapy ? treatment.therapy.split('-')[1].trim() : "As needed",
            notes: null
          })) : []
        };

        setProfileData(transformedData);
      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleUpdatePatientInfo = async (updatedInfo: any) => {
    if (!user || !profileData) return;

    try {
      const { error } = await supabase
        .from('patients')
        .update(updatedInfo)
        .eq('patientid', profileData.patientid);

      if (error) throw error;
      
      setProfileData(prev => prev ? { ...prev, ...updatedInfo } : null);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleSaveProvider = async () => {
    if (!profileData || !provider.name) {
      toast.error("Provider name is required");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('healthcareproviders')
        .upsert({
          patientid: profileData.patientid,
          name: provider.name,
          specialization: provider.specialty || 'General',
          contact: provider.phone,
        })
        .select('providerid, name, specialization, contact')
        .single();

      if (error) throw error;
      
      setProfileData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          healthcareProvider: {
            id: data.providerid,
            name: data.name,
            specialty: data.specialization,
            phone: data.contact
          }
        };
      });
      
      setProviderDialogOpen(false);
      toast.success("Healthcare provider updated successfully");
    } catch (error: any) {
      console.error('Error saving provider:', error);
      toast.error('Failed to save provider information');
    }
  };

  const handleSaveFamily = async () => {
    if (!profileData || !newFamilyForm.name || !newFamilyForm.phone) {
      toast.error("Name and phone are required");
      return;
    }
    
    try {
      const newMember = {
        patientid: profileData.patientid,
        name: newFamilyForm.name,
        relationship: newFamilyForm.relationship || 'Not specified',
        contact: newFamilyForm.phone
      };
      
      let data;
      
      if (editingFamilyMember) {
        const { data: updateData, error } = await supabase
          .from('familymembers')
          .update(newMember)
          .eq('relationid', editingFamilyMember.id)
          .select()
          .single();
          
        if (error) throw error;
        data = updateData;
      } else {
        const { data: insertData, error } = await supabase
          .from('familymembers')
          .insert(newMember)
          .select()
          .single();
          
        if (error) throw error;
        data = insertData;
      }

      setProfileData(prev => {
        if (!prev) return null;
        
        const transformedMember = {
          id: data.relationid,
          name: data.name,
          relationship: data.relationship,
          phone: data.contact
        };
        
        return {
          ...prev,
          familyMembers: editingFamilyMember 
            ? prev.familyMembers.map(m => m.id === editingFamilyMember.id ? transformedMember : m)
            : [...prev.familyMembers, transformedMember]
        };
      });
      
      setFamilyDialogOpen(false);
      setEditingFamilyMember(null);
      setNewFamilyForm({ name: "", relationship: "", phone: "" });
      toast.success(editingFamilyMember ? "Family member updated" : "Family member added");
    } catch (error: any) {
      console.error('Error saving family member:', error);
      toast.error('Failed to save family member');
    }
  };

  const handleSaveMedication = async () => {
    if (!profileData || !newMedicationForm.name || !newMedicationForm.frequency) {
      toast.error("Name and frequency are required");
      return;
    }
    
    try {
      const therapy = `${newMedicationForm.dosage || 'No dosage'} - ${newMedicationForm.frequency}`;
      
      let data;
      
      if (editingMedication) {
        const { data: updateData, error } = await supabase
          .from('treatments')
          .update({
            patientid: profileData.patientid,
            treatmenttype: 'Medication',
            medication: newMedicationForm.name,
            therapy: therapy
          })
          .eq('treatmentid', editingMedication.id)
          .select()
          .single();
          
        if (error) throw error;
        data = updateData;
      } else {
        const { data: insertData, error } = await supabase
          .from('treatments')
          .insert({
            patientid: profileData.patientid,
            treatmenttype: 'Medication',
            medication: newMedicationForm.name,
            therapy: therapy
          })
          .select()
          .single();
          
        if (error) throw error;
        data = insertData;
      }

      setProfileData(prev => {
        if (!prev) return null;
        
        const transformedMedication = {
          id: data.treatmentid,
          name: data.medication,
          dosage: data.therapy.split('-')[0].trim(),
          frequency: data.therapy.split('-')[1].trim(),
          notes: newMedicationForm.notes || null
        };
        
        return {
          ...prev,
          treatments: editingMedication
            ? prev.treatments.map(m => m.id === editingMedication.id ? transformedMedication : m)
            : [...prev.treatments, transformedMedication]
        };
      });
      
      setMedicationDialogOpen(false);
      setEditingMedication(null);
      setNewMedicationForm({
        name: "",
        dosage: "",
        frequency: "",
        notes: ""
      });
      toast.success(editingMedication ? "Medication updated" : "Medication added");
    } catch (error: any) {
      console.error('Error saving medication:', error);
      toast.error('Failed to save medication');
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!profileData) return;
    
    try {
      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('treatmentid', id);

      if (error) throw error;
      
      setProfileData(prev => prev ? {
        ...prev,
        treatments: prev.treatments.filter(med => med.id !== id)
      } : null);
      
      toast.success("Medication removed successfully");
    } catch (error: any) {
      console.error('Error deleting medication:', error);
      toast.error('Failed to remove medication');
    }
  };

  const handleDeleteFamily = async (id: string) => {
    if (!profileData) return;
    
    try {
      const { error } = await supabase
        .from('familymembers')
        .delete()
        .eq('relationid', id);

      if (error) throw error;
      
      setProfileData(prev => prev ? {
        ...prev,
        familyMembers: prev.familyMembers.filter(member => member.id !== id)
      } : null);
      
      toast.success("Family member removed successfully");
    } catch (error: any) {
      console.error('Error deleting family member:', error);
      toast.error('Failed to remove family member');
    }
  };

  function handleEditMedication(treatment: any) {
    setEditingMedication(treatment);
    setNewMedicationForm({
      name: treatment.name,
      dosage: treatment.dosage || "",
      frequency: treatment.frequency,
      notes: treatment.notes || ""
    });
    setMedicationDialogOpen(true);
  }

  function handleEditFamily(member: any) {
    setEditingFamilyMember(member);
    setNewFamilyForm({
      name: member.name,
      relationship: member.relationship || "",
      phone: member.phone
    });
    setFamilyDialogOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Please log in to view your profile</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-muted-foreground mb-8">
        Manage your personal and medical information
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Personal Information</span>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{profileData?.name}</h3>
                <p className="text-sm text-muted-foreground">{profileData?.contact}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Healthcare Provider</CardTitle>
              <Button variant="outline" size="icon" onClick={() => setProviderDialogOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Your primary healthcare provider</CardDescription>
          </CardHeader>
          <CardContent>
            {profileData?.healthcareProvider ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <UserCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{profileData.healthcareProvider.name}</h3>
                    <p className="text-sm text-muted-foreground">{profileData.healthcareProvider.specialty}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <span>{profileData.healthcareProvider.phone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <UserCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No provider added</p>
                <Button variant="outline" className="mt-4" onClick={() => setProviderDialogOpen(true)}>
                  Add Provider
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Family Members</CardTitle>
              <Button variant="outline" size="icon" onClick={() => {
                setEditingFamilyMember(null);
                setNewFamilyForm({ name: "", relationship: "", phone: "" });
                setFamilyDialogOpen(true);
              }}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Button>
            </div>
            <CardDescription>Emergency contacts</CardDescription>
          </CardHeader>
          <CardContent>
            {profileData?.familyMembers.length > 0 ? (
              <div className="space-y-4">
                {profileData.familyMembers.map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{member.relationship}</span>
                          <span className="mx-2">•</span>
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditFamily(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFamily(member.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <User className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No family members added</p>
                <Button variant="outline" className="mt-4" onClick={() => setFamilyDialogOpen(true)}>
                  Add Family Member
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Current Treatments</CardTitle>
            <Button variant="outline" onClick={() => {
              setEditingMedication(null);
              setNewMedicationForm({ name: "", dosage: "", frequency: "", notes: "" });
              setMedicationDialogOpen(true);
            }}>
              Add Treatment
            </Button>
          </div>
          <CardDescription>Track your medications and treatments</CardDescription>
        </CardHeader>
        <CardContent>
          {profileData?.treatments.length > 0 ? (
            <div className="divide-y divide-border">
              {profileData.treatments.map((treatment) => (
                <div key={treatment.id} className="py-4 flex justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Pill className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium">{treatment.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {treatment.dosage && `${treatment.dosage}, `}{treatment.frequency}
                      </p>
                      {treatment.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Note: {treatment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditMedication(treatment)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMedication(treatment.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Pill className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-4">No treatments added yet</p>
              <Button onClick={() => setMedicationDialogOpen(true)}>
                Add Your First Treatment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <EditDialog
        title={editingMedication ? "Edit Treatment" : "Add Treatment"}
        description="Add or update your medication or treatment information"
        open={medicationDialogOpen}
        onOpenChange={setMedicationDialogOpen}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Treatment Name</Label>
            <Input
              id="name"
              name="name"
              value={newMedicationForm.name}
              onChange={(e: any) => setNewMedicationForm({...newMedicationForm, name: e.target.value})}
              placeholder="e.g., Ibuprofen"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage (optional)</Label>
            <Input
              id="dosage"
              name="dosage"
              value={newMedicationForm.dosage}
              onChange={(e: any) => setNewMedicationForm({...newMedicationForm, dosage: e.target.value})}
              placeholder="e.g., 200mg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Input
              id="frequency"
              name="frequency"
              value={newMedicationForm.frequency}
              onChange={(e: any) => setNewMedicationForm({...newMedicationForm, frequency: e.target.value})}
              placeholder="e.g., 3x daily"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              name="notes"
              value={newMedicationForm.notes}
              onChange={(e: any) => setNewMedicationForm({...newMedicationForm, notes: e.target.value})}
              placeholder="e.g., Take with food"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setMedicationDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveMedication}>
            {editingMedication ? "Update" : "Add"} Treatment
          </Button>
        </DialogFooter>
      </EditDialog>
      
      <EditDialog
        title="Healthcare Provider"
        description="Update your healthcare provider information"
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
      >
        <ProviderDialog
          provider={provider}
          setProvider={setProvider}
          onSave={handleSaveProvider}
          onCancel={() => setProviderDialogOpen(false)}
        />
      </EditDialog>
      
      <EditDialog
        title={editingFamilyMember ? "Edit Family Member" : "Add Family Member"}
        description="Add or update family member information"
        open={familyDialogOpen}
        onOpenChange={setFamilyDialogOpen}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="familyName">Name</Label>
            <Input
              id="familyName"
              name="name"
              value={newFamilyForm.name}
              onChange={(e: any) => setNewFamilyForm({...newFamilyForm, name: e.target.value})}
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              name="relationship"
              value={newFamilyForm.relationship}
              onChange={(e: any) => setNewFamilyForm({...newFamilyForm, relationship: e.target.value})}
              placeholder="e.g., Spouse"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="familyPhone">Phone</Label>
            <Input
              id="familyPhone"
              name="phone"
              value={newFamilyForm.phone}
              onChange={(e: any) => setNewFamilyForm({...newFamilyForm, phone: e.target.value})}
              placeholder="e.g., 555-987-6543"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setFamilyDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveFamily}>
            {editingFamilyMember ? "Update" : "Add"} Family Member
          </Button>
        </DialogFooter>
      </EditDialog>
    </div>
  );
}

export default Profile;
